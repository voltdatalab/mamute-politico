import type { JWK } from "jwk-to-pem";

// JWKS from {AUTH_API_ROOT}/members/.well-known/jwks.json (not ghost/.well-known/jwks.json)
const raw = import.meta.env.VITE_GHOST_JWKS;
export const publicKey =
  typeof raw === "string" && raw ? (JSON.parse(raw).keys[0] as JWK) : null;
