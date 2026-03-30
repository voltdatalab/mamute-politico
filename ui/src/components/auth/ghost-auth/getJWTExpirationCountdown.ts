import type { JwtPayload } from "jsonwebtoken";

export function getJWTExpirationCountdown(decodedToken: JwtPayload) {
  const expirationTime = (decodedToken.exp as number) * 1000;
  return expirationTime - Date.now();
}
