# AgentID key-auth conformance fixtures

`agentid-key-auth-v1.json` is the canonical, language-neutral fixture for the
AgentID public-key registration and approval protocol. Backend and SDK suites
should consume this file directly (or vendor it byte-for-byte with its version)
instead of retyping the values.

The fixture pins:

- the strict public P-256 JWK and its RFC 7638 SHA-256 thumbprint;
- `api_key_id` as the approval assertion `kid`;
- the exact `ES256` / `agentid-approval+jwt` protected header;
- the exact `{jti, inbox_id}` payload and one valid compact JWS;
- cryptographically valid semantic failures and signature-breaking mutations.

The private JWK is intentionally public test material. Never register or use it
outside conformance tests. Run `npm run fixtures:check` to verify every vector
offline with Node's standard crypto implementation.
