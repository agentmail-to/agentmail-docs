#!/usr/bin/env bash
#
# Regression check: AGENTMAIL_API_KEY must win over AGENTMAIL_TOKEN.
#
# The generated CLI declares two auth sources (main.rs):
#     .auth(BearerAuth::new("BearerAuth").env("AGENTMAIL_API_KEY"))
#     .auth(BearerAuth::new("TokenAuth").env("AGENTMAIL_TOKEN"))
# Both are `scheme: bearer`, so both write the SAME `Authorization` header.
# When both env vars are set the CLI can emit TWO Authorization headers; the
# credential a first-reading server honors is whichever is applied first.
#
# Empirically (verified 2026-07-29 by flipping every config knob and
# regenerating): precedence is NOT controlled by config order. It is decided
# by the SDK's alphabetical scheme-name sort (compose.rs `scheme_names.sort()`)
# plus the base spec anchoring `BearerAuth` first — so "BearerAuth" (< "Token")
# maps AGENTMAIL_API_KEY to the first header. A generator upgrade that changes
# that sort/merge could silently flip which credential wins. This test catches
# that: it sets BOTH env vars to distinct sentinels, hits a localhost echo
# server with a read-only GET, and asserts the API_KEY sentinel lands first.
#
# Usage:
#   bin/check-cli-auth-precedence.sh /path/to/agentmail            # binary, or
#   AGENTMAIL_CLI_BIN=/path/to/agentmail bin/check-cli-auth-precedence.sh
#   PORT override: AGENTMAIL_ECHO_PORT=8207 bin/check-cli-auth-precedence.sh ...
#
# Exit 0 = precedence correct (API_KEY first). Non-zero = flipped or broken.

set -euo pipefail

BIN="${1:-${AGENTMAIL_CLI_BIN:-}}"
if [[ -z "$BIN" ]]; then
  echo "ERROR: pass the agentmail CLI binary path as \$1 or via AGENTMAIL_CLI_BIN." >&2
  exit 2
fi
if [[ ! -x "$BIN" ]]; then
  echo "ERROR: not an executable binary: $BIN" >&2
  exit 2
fi

PORT="${AGENTMAIL_ECHO_PORT:-8207}"
API_KEY_SENTINEL="api-key-should-win"
TOKEN_SENTINEL="token-should-lose"

workdir="$(mktemp -d)"
srv_py="$workdir/echo.py"
auth_file="$workdir/auth"

cat > "$srv_py" <<'PY'
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
auth_file = sys.argv[1]
class H(BaseHTTPRequestHandler):
    def do_GET(self):
        # Capture EVERY Authorization header (both schemes are `scheme: bearer`,
        # so both land here when both env vars are set). The /health readiness
        # probe carries no auth and is ignored; only real API paths are recorded.
        if self.path != "/health":
            auths = self.headers.get_all("Authorization") or ["<none>"]
            with open(auth_file, "w") as f:
                f.write("\n".join(auths))
        b = b'{"inboxes":[],"count":0}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(b)))
        self.end_headers()
        self.wfile.write(b)
    def log_message(self, *a):
        pass
HTTPServer(("127.0.0.1", int(sys.argv[2]), ), H).serve_forever()
PY

python3 "$srv_py" "$auth_file" "$PORT" &
srv_pid=$!
cleanup() { kill "$srv_pid" 2>/dev/null || true; wait "$srv_pid" 2>/dev/null || true; rm -rf "$workdir"; }
trap cleanup EXIT

# Wait until the server actually accepts connections (proven-reliable readiness).
ready=""
for _ in $(seq 1 50); do
  if curl -s -o /dev/null "http://127.0.0.1:$PORT/health"; then ready=1; break; fi
  sleep 0.1
done
if [[ -z "$ready" ]]; then echo "ERROR: echo server never became ready on :$PORT" >&2; exit 3; fi

# read-only GET with BOTH credentials set to distinct values
env AGENTMAIL_API_KEY="$API_KEY_SENTINEL" AGENTMAIL_TOKEN="$TOKEN_SENTINEL" \
    "$BIN" inboxes list --base-url "http://127.0.0.1:$PORT" >/dev/null 2>&1 || true

if [[ ! -f "$auth_file" ]]; then
  echo "FAIL: the CLI never reached the echo server (no request recorded)." >&2
  exit 3
fi
# Read one Authorization header per line (bash 3.2 compatible; macOS ships 3.2,
# which has no `mapfile`).
auths=()
while IFS= read -r line || [[ -n "$line" ]]; do auths+=("$line"); done < "$auth_file"
first="${auths[0]:-<none>}"
want="Bearer $API_KEY_SENTINEL"

echo "Authorization header(s) sent (${#auths[@]}):"
printf '  %s\n' "${auths[@]}"

if (( ${#auths[@]} > 1 )); then
  echo "WARNING: ${#auths[@]} Authorization headers were sent (duplicate-header bug;" \
       "both schemes are 'scheme: bearer'). Precedence then depends on how the" \
       "server reads duplicate headers." >&2
fi

if [[ "$first" == "$want" ]]; then
  echo "PASS: AGENTMAIL_API_KEY is the first credential the server sees (expected)."
  exit 0
fi
echo "FAIL: expected first Authorization to be '$want' but it was '$first'." >&2
if [[ "$first" == "Bearer $TOKEN_SENTINEL" ]]; then
  echo "       -> precedence FLIPPED: AGENTMAIL_TOKEN is now first." >&2
  echo "       -> the SDK applies schemes in alphabetical name order" \
       "(compose.rs scheme_names.sort()); a generator change likely altered it." >&2
fi
exit 1
