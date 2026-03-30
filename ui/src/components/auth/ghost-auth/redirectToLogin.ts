import type { GhostAuthStateWrapper } from "./types";

export function redirectToLogin(stateWrapper: GhostAuthStateWrapper) {
  if (!stateWrapper.config.loginURL) {
    throw new Error("Missing config.loginURL");
  }
  window.location.href = stateWrapper.config.loginURL;
}
