import { createHmac, timingSafeEqual } from "node:crypto";

/** Verifies the signed_request Meta sends to the uninstall and delete callbacks. */
export function verifySignedRequest(signedRequest: unknown) {
  const secret = process.env.THREADS_APP_SECRET;
  if (!secret || typeof signedRequest !== "string") return null;
  const [signature, payload] = signedRequest.split(".");
  if (!signature || !payload) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  const given = Buffer.from(signature, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { user_id?: string };
  } catch {
    return null;
  }
}
