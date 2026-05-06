import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function randomCode(len = 12): string {
  const bytes = randomBytes(len);
  let out = "";
  for (let i = 0; i < len; i++) {
    out += ALPHABET[bytes[i] % ALPHABET.length]!;
  }
  return out;
}

