import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "trulab_admin";
export const SESSION_SECONDS = 12 * 60 * 60;
const MIN_PASSWORD_LENGTH = 12;

function adminPassword() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return password.length >= MIN_PASSWORD_LENGTH ? password : null;
}

export const adminConfigured = () => adminPassword() !== null;

function sameText(a: string, b: string) {
  const left = createHash("sha256").update(a).digest();
  const right = createHash("sha256").update(b).digest();
  return timingSafeEqual(left, right);
}

export function passwordMatches(given: string) {
  const password = adminPassword();
  return password !== null && sameText(given, password);
}

// Sessions are signed with the password, so changing it signs everyone out.
function sign(expires: string, password: string) {
  return createHmac("sha256", password).update(`admin:${expires}`).digest("hex");
}

export function createSession() {
  const password = adminPassword();
  if (!password) throw new Error("ADMIN_PASSWORD is not configured");
  const expires = String(Date.now() + SESSION_SECONDS * 1000);
  return `${expires}.${sign(expires, password)}`;
}

export async function isAdmin() {
  const password = adminPassword();
  const session = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!password || !session) return false;
  const [expires, signature = ""] = session.split(".");
  return Number(expires) > Date.now() && sameText(signature, sign(expires, password));
}
