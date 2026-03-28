import type {
  GhostAuthStateWrapper,
  GhostAuthServiceConfig,
} from "./types";

export function setupStateWrapper(
  stateWrapper: GhostAuthStateWrapper,
  config: GhostAuthServiceConfig
): void {
  if (!config.tokenEndpoint) {
    throw new Error("Missing config.tokenEndpoint");
  }
  if (!config.loginURL) {
    throw new Error("Missing config.loginURL");
  }
  if (!config.storageKey) {
    throw new Error("Missing config.storageKey");
  }
  if (!config.persistenceChoice) {
    throw new Error("Missing config.persistenceChoice");
  }
  stateWrapper.config.publicKey = config.publicKey;
  stateWrapper.config.tokenEndpoint = config.tokenEndpoint;
  stateWrapper.config.loginURL = config.loginURL;
  stateWrapper.config.storageKey = config.storageKey;
  stateWrapper.config.persistenceChoice = config.persistenceChoice;
  stateWrapper.token = config.persistenceChoice.getItem(config.storageKey);
}
