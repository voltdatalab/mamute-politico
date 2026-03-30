import { GhostAuthStateWrapper } from "./types";
import { universalVerifyToken } from "./universalVerifyToken";

export function verifyToken(stateWrapper: GhostAuthStateWrapper, token: string) {
  const { publicKey } = stateWrapper.config;
  if (!publicKey) {
    throw new Error(
      'Missing "publicKey" in config. Please provide one of your keys from your JWKS file'
    );
  }
  return universalVerifyToken(publicKey, token);
}
