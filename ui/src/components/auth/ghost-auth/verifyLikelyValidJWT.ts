import { getJWTExpirationCountdown } from "./getJWTExpirationCountdown";
import type { GhostAuthStateWrapper } from "./types";

export function verifyLikelyValidJWT(stateWrapper: GhostAuthStateWrapper) {
  if (!stateWrapper.likelyValidAndParsedToken) {
    return null;
  }
  const countdown = getJWTExpirationCountdown(
    stateWrapper.likelyValidAndParsedToken
  );
  if (countdown > 0) {
    return stateWrapper.likelyValidAndParsedToken;
  }
  return null;
}
