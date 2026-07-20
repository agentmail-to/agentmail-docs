import {
  createHash,
  createPrivateKey,
  createPublicKey,
  verify,
} from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

type Jwk = {
  kty: "EC";
  crv: "P-256";
  x: string;
  y: string;
  d?: string;
};

type Fixture = {
  version: number;
  key: {
    private_jwk_test_only: Jwk;
    public_jwk: Jwk;
    rfc7638_sha256_thumbprint: string;
  };
  credential: { api_key_id: string };
  approval: {
    protected_header: Record<string, unknown>;
    payload: Record<string, unknown>;
    compact_assertion: string;
    request_body: { assertion: string; inbox_id: string };
  };
  rejected_assertions: Array<{
    name: string;
    assertion: string;
    signature_valid: boolean;
    expected_status: number;
    reason: string;
  }>;
};

const fixturePath = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "conformance",
  "agentid-key-auth-v1.json",
);
const fixture = JSON.parse(readFileSync(fixturePath, "utf8")) as Fixture;

const fail = (message: string): never => {
  throw new Error(message);
};
const equal = (actual: unknown, expected: unknown, message: string) => {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) fail(message);
};
const decode = (segment: string) =>
  JSON.parse(Buffer.from(segment, "base64url").toString("utf8")) as Record<
    string,
    unknown
  >;
const parts = (assertion: string) => {
  const value = assertion.split(".");
  if (value.length !== 3 || value.some((segment) => segment.length === 0)) {
    fail("assertion is not a compact JWS");
  }
  return value as [string, string, string];
};

const publicJwk = fixture.key.public_jwk;
equal(
  Object.keys(publicJwk),
  ["kty", "crv", "x", "y"],
  "public JWK must expose exactly kty, crv, x, and y",
);
if (
  publicJwk.kty !== "EC" ||
  publicJwk.crv !== "P-256" ||
  !/^[A-Za-z0-9_-]{43}$/.test(publicJwk.x) ||
  !/^[A-Za-z0-9_-]{43}$/.test(publicJwk.y)
) {
  fail("public JWK is not a strict P-256 key");
}

const canonicalJwk = JSON.stringify({
  crv: publicJwk.crv,
  kty: publicJwk.kty,
  x: publicJwk.x,
  y: publicJwk.y,
});
const thumbprint = createHash("sha256")
  .update(canonicalJwk)
  .digest("base64url");
if (thumbprint !== fixture.key.rfc7638_sha256_thumbprint) {
  fail("RFC 7638 thumbprint does not match");
}

const derivedPublic = createPublicKey(
  createPrivateKey({ key: fixture.key.private_jwk_test_only, format: "jwk" }),
).export({ format: "jwk" });
equal(
  {
    kty: derivedPublic.kty,
    crv: derivedPublic.crv,
    x: derivedPublic.x,
    y: derivedPublic.y,
  },
  publicJwk,
  "test private JWK does not derive the public JWK",
);

const verifyCompact = (assertion: string) => {
  const [header, payload, signature] = parts(assertion);
  return verify(
    "sha256",
    Buffer.from(`${header}.${payload}`),
    {
      key: createPublicKey({ key: publicJwk, format: "jwk" }),
      dsaEncoding: "ieee-p1363",
    },
    Buffer.from(signature, "base64url"),
  );
};

const [header, payload] = parts(fixture.approval.compact_assertion);
equal(
  decode(header),
  fixture.approval.protected_header,
  "valid protected header changed",
);
equal(
  decode(payload),
  fixture.approval.payload,
  "valid signed payload changed",
);
equal(
  fixture.approval.protected_header,
  {
    alg: "ES256",
    typ: "agentid-approval+jwt",
    kid: fixture.credential.api_key_id,
  },
  "protected header is not exactly the AgentID contract",
);
equal(
  Object.keys(fixture.approval.payload),
  ["jti", "inbox_id"],
  "approval payload must contain exactly jti and inbox_id",
);
if (!verifyCompact(fixture.approval.compact_assertion)) {
  fail("valid compact assertion signature failed verification");
}
if (
  fixture.approval.request_body.assertion !== fixture.approval.compact_assertion
) {
  fail("request body does not carry the valid assertion");
}
if (
  fixture.approval.request_body.inbox_id !== fixture.approval.payload.inbox_id
) {
  fail("unsigned inbox_id is not byte-for-byte equal to the signed claim");
}

const expectedRejections = {
  wrong_typ: true,
  extra_claim: true,
  tampered_header: false,
  tampered_payload: false,
};
equal(
  Object.fromEntries(
    fixture.rejected_assertions.map((vector) => [
      vector.name,
      vector.signature_valid,
    ]),
  ),
  expectedRejections,
  "rejection vector inventory changed",
);
for (const vector of fixture.rejected_assertions) {
  if (verifyCompact(vector.assertion) !== vector.signature_valid) {
    fail(`${vector.name} signature expectation does not match`);
  }
  if (!vector.reason || ![400, 401].includes(vector.expected_status)) {
    fail(`${vector.name} does not describe its expected rejection`);
  }
}

const rejected = Object.fromEntries(
  fixture.rejected_assertions.map((vector) => [vector.name, vector]),
);
const [wrongTypHeader, wrongTypPayload] = parts(rejected.wrong_typ.assertion);
equal(
  decode(wrongTypHeader),
  { alg: "ES256", typ: "JWT", kid: fixture.credential.api_key_id },
  "wrong_typ must be validly signed with the wrong typ only",
);
equal(
  decode(wrongTypPayload),
  fixture.approval.payload,
  "wrong_typ payload changed",
);

const [extraClaimHeader, extraClaimPayload] = parts(
  rejected.extra_claim.assertion,
);
equal(
  decode(extraClaimHeader),
  fixture.approval.protected_header,
  "extra_claim protected header changed",
);
equal(
  decode(extraClaimPayload),
  { ...fixture.approval.payload, iat: 1_700_000_000 },
  "extra_claim must add only iat to the exact payload",
);

const [tamperedHeader] = parts(rejected.tampered_header.assertion);
equal(
  decode(tamperedHeader),
  { ...fixture.approval.protected_header, crit: ["exp"] },
  "tampered_header must add forbidden crit without resigning",
);

const [, tamperedPayload] = parts(rejected.tampered_payload.assertion);
equal(
  decode(tamperedPayload),
  { ...fixture.approval.payload, inbox_id: "other@example.com" },
  "tampered_payload must change only inbox_id without resigning",
);

console.log(`AgentID key-auth fixture v${fixture.version} is valid.`);
