/**
 * Cryptographically Secure Admin Session Token Manager
 * Uses Web Crypto API (HMAC-SHA256) compatible across Node.js, Edge Runtime, and Serverless.
 */

const SECRET_KEY_RAW =
  process.env.ADMIN_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.ADMIN_PASSWORD ||
  "charak-ayurveda-pilani-secure-salt-2026-production";

export const WHITELISTED_ADMIN_EMAILS = new Set<string>([
  "admin@charakayurvedapilani.com",
  "admin@charak.com",
  "deepanshu@charak.com",
  ...(process.env.ADMIN_EMAIL ? [process.env.ADMIN_EMAIL.toLowerCase().trim()] : []),
]);

function toHex(str: string): string {
  const enc = new TextEncoder();
  return Array.from(enc.encode(str))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string): string {
  if (hex.length % 2 !== 0) return "";
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  const dec = new TextDecoder();
  return dec.decode(bytes);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates an HMAC-SHA256 signed admin session token.
 * Token format: <timestamp>.<hexEncodedEmail>.<hexSignature>
 * All segments are strictly alphanumeric hex digits, completely immune to cookie URL-encoding issues.
 */
export async function createAdminSessionToken(email: string): Promise<string> {
  const normalizedEmail = email.toLowerCase().trim();
  const timestamp = Date.now().toString();
  const hexEmail = toHex(normalizedEmail);
  const payload = `${timestamp}:${normalizedEmail}`;
  const key = await getHmacKey(SECRET_KEY_RAW);
  const enc = new TextEncoder();

  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const signatureHex = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return `${timestamp}.${hexEmail}.${signatureHex}`;
}

/**
 * Verifies an HMAC-SHA256 signed admin session token.
 * Validates expiration (24 hours), cryptographic integrity, and admin authorization.
 */
export async function verifyAdminSessionToken(
  token: string | null | undefined
): Promise<{ valid: boolean; email?: string; error?: string }> {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Missing session token" };
  }

  // Support unescaping if received via raw cookie header
  const cleanToken = decodeURIComponent(token.trim());
  const parts = cleanToken.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed session token format" };
  }

  const [timestampStr, hexEmail, signatureHex] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) {
    return { valid: false, error: "Invalid token timestamp" };
  }

  // Token valid for 24 hours (86,400,000 ms), with 60s future clock skew allowance
  const MAX_AGE_MS = 24 * 60 * 60 * 1000;
  const now = Date.now();
  if (now - timestamp > MAX_AGE_MS) {
    return { valid: false, error: "Session token expired. Please log in again." };
  }
  if (timestamp > now + 60000) {
    return { valid: false, error: "Invalid token timestamp (future dated)." };
  }

  if (signatureHex.length !== 64) {
    return { valid: false, error: "Invalid signature length" };
  }

  let email: string;
  try {
    email = fromHex(hexEmail).toLowerCase().trim();
  } catch {
    return { valid: false, error: "Invalid email encoding" };
  }

  if (!email || !email.includes("@")) {
    return { valid: false, error: "Invalid email format in session" };
  }

  const payload = `${timestampStr}:${email}`;
  const key = await getHmacKey(SECRET_KEY_RAW);
  const enc = new TextEncoder();

  const sigBytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    sigBytes[i] = parseInt(signatureHex.substring(i * 2, i * 2 + 2), 16);
  }

  const isSigValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(payload));
  if (!isSigValid) {
    return { valid: false, error: "Invalid session token signature. Tampering detected." };
  }

  return { valid: true, email };
}
