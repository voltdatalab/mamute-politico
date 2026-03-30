import type { JwtPayload } from "jsonwebtoken";
import jwt from "jsonwebtoken";
import { getJWTExpirationCountdown } from "./getJWTExpirationCountdown";
import { verifyToken } from "./verifyToken";
import type { GhostAuthStateWrapper } from "./types";

export function verifyTokenAndGetExpirationCountdown(
  stateWrapper: GhostAuthStateWrapper,
  jwtString: string
) {
  let decodedToken: JwtPayload;
  if (stateWrapper.config.publicKey) {
    decodedToken = verifyToken(stateWrapper, jwtString) as JwtPayload;
  } else {
    const decoded = jwt.decode(jwtString);
    if (!decoded || typeof decoded === "string") {
      throw new Error("Invalid or missing JWT payload");
    }
    decodedToken = decoded as JwtPayload;
  }
  const expirationCountdown = getJWTExpirationCountdown(decodedToken);
  return { expirationCountdown, decodedToken };
}
