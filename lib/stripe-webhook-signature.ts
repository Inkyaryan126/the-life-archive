import { createHmac, timingSafeEqual } from "crypto";

export function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string,
  now = new Date()
): boolean {
  const parts = signature.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");
    if (!key || !value) {
      return acc;
    }

    acc[key] = [...(acc[key] ?? []), value];
    return acc;
  }, {});

  const timestamp = parts.t?.[0];
  const signatures = parts.v1 ?? [];

  if (!timestamp || signatures.length === 0) {
    return false;
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);
  const timestampSeconds = Number.parseInt(timestamp, 10);

  if (
    !Number.isSafeInteger(timestampSeconds) ||
    Math.abs(nowSeconds - timestampSeconds) > 300
  ) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);

  return signatures.some((value) => {
    const actualBuffer = Buffer.from(value);

    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  });
}
