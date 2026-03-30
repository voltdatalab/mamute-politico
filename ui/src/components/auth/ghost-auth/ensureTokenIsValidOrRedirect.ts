import { notifySubscribers } from "./notifySubscribers";
import { renewToken } from "./renewToken";
import { scheduleTokenRenewal } from "./scheduleTokenRenewal";
import type { GhostAuthStateWrapper } from "./types";
import { verifyLikelyValidJWT } from "./verifyLikelyValidJWT";
import { verifyTokenAndGetExpirationCountdown } from "./verifyTokenAndGetExpirationCountdown";

export async function ensureTokenIsValidOrRedirect(
  stateWrapper: GhostAuthStateWrapper
): Promise<{ token: string | null; jwtPayload: unknown }> {
  const likelyValidJWT = verifyLikelyValidJWT(stateWrapper);
  if (likelyValidJWT) {
    scheduleTokenRenewal(stateWrapper);
    return {
      token: stateWrapper.token as string,
      jwtPayload: likelyValidJWT,
    };
  }
  try {
    if (!stateWrapper.token) {
      throw new Error("Token was not provided");
    }
    const { decodedToken } = verifyTokenAndGetExpirationCountdown(
      stateWrapper,
      stateWrapper.token
    );
    stateWrapper.likelyValidAndParsedToken = decodedToken;
    scheduleTokenRenewal(stateWrapper);
    notifySubscribers(stateWrapper);
    return {
      token: stateWrapper.token,
      jwtPayload: decodedToken,
    };
  } catch {
    await renewToken(stateWrapper);
    return {
      token: stateWrapper.token,
      jwtPayload: stateWrapper.likelyValidAndParsedToken,
    };
  }
}
