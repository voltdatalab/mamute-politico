import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";

export function universalVerifyToken(
  publicKey: import("jwk-to-pem").JWK | null,
  token: string
) {
  if (!publicKey) {
    throw new Error("Please provide the publicKey to verify token");
  }
  const publicToken = jwkToPem(publicKey);
  return jwt.verify(token, publicToken, { algorithms: ["RS512"] });
}
