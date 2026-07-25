import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { verifyStripeSignature } from "../lib/stripe-webhook-signature";

function signPayload(payload: string, timestamp: string | number, secret: string): string {
  const signedPayload = `${timestamp}.${payload}`;
  const sig = createHmac("sha256", secret).update(signedPayload).digest("hex");
  return `t=${timestamp},v1=${sig}`;
}

const secret = "whsec_test_secret_123456789";
const payload = JSON.stringify({ id: "evt_123", type: "checkout.session.completed" });
const fixedNow = new Date("2026-07-25T00:00:00.000Z");
const nowUnix = Math.floor(fixedNow.getTime() / 1000);

{
  // 1. Accept a correctly signed payload with a current timestamp
  const signature = signPayload(payload, nowUnix, secret);
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), true);
}

{
  // 2. Accept a correctly signed payload exactly 300 seconds old
  const signature = signPayload(payload, nowUnix - 300, secret);
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), true);
}

{
  // 3. Reject a correctly signed payload 301 seconds old
  const signature = signPayload(payload, nowUnix - 301, secret);
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), false);
}

{
  // 4. Reject a correctly signed payload more than 300 seconds in the future
  const signature = signPayload(payload, nowUnix + 301, secret);
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), false);
}

{
  // 5. Reject a malformed timestamp
  const signature = "t=not_a_number,v1=abcdef123456";
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), false);
}

{
  // 6. Reject a missing timestamp
  const signature = "v1=abcdef123456";
  assert.equal(verifyStripeSignature(payload, signature, secret, fixedNow), false);
}

{
  // 7. Reject a valid timestamp with an invalid signature
  const validTimestampSig = signPayload(payload, nowUnix, secret);
  const invalidSignature = validTimestampSig.replace(/v1=[a-f0-9]+/, "v1=0000000000000000000000000000000000000000000000000000000000000000");
  assert.equal(verifyStripeSignature(payload, invalidSignature, secret, fixedNow), false);
}

{
  // 8. Accept the request when any valid v1 signature matches, if multiple v1 signatures are present
  const validSig = createHmac("sha256", secret).update(`${nowUnix}.${payload}`).digest("hex");
  const multipleSignatures = `t=${nowUnix},v1=invalid_signature_attempt,v1=${validSig}`;
  assert.equal(verifyStripeSignature(payload, multipleSignatures, secret, fixedNow), true);
}

console.log("stripe-webhook-signature tests passed cleanly!");
