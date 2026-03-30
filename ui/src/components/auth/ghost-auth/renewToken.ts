import { notifySubscribers } from "./notifySubscribers";
import { requestNewToken } from "./requestNewToken";
import { scheduleTokenRenewal } from "./scheduleTokenRenewal";
import type { GhostAuthStateWrapper } from "./types";
import { verifyTokenAndGetExpirationCountdown } from "./verifyTokenAndGetExpirationCountdown";

export async function renewToken(
  stateWrapper: GhostAuthStateWrapper
): Promise<void> {
  if (stateWrapper.isLoading) {
    return;
  }
  stateWrapper.isLoading = true;
  try {
    const receivedToken = await requestNewToken(stateWrapper);
    if (!stateWrapper.config.storageKey || !stateWrapper.config.persistenceChoice) {
      throw new Error("Missing config.storageKey or persistenceChoice");
    }
    stateWrapper.config.persistenceChoice.setItem(
      stateWrapper.config.storageKey,
      receivedToken
    );
    stateWrapper.token = receivedToken;
    stateWrapper.likelyValidAndParsedToken =
      verifyTokenAndGetExpirationCountdown(stateWrapper, stateWrapper.token)
        .decodedToken;
    scheduleTokenRenewal(stateWrapper);
    notifySubscribers(stateWrapper);
    stateWrapper.queue.forEach((fn) => fn(stateWrapper.token as string));
    stateWrapper.queue = [];
  } catch (error) {
    console.error("Token renewal failed", error);
  } finally {
    stateWrapper.isLoading = false;
  }
}
