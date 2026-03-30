import type { JwtPayload } from "jsonwebtoken";
import type { JWK } from "jwk-to-pem";

export type GhostAuthStateWrapper = {
  token: string | null;
  /** A JWT that has been parsed and should be valid */
  likelyValidAndParsedToken: JwtPayload | null;
  isLoading: boolean;
  queue: ((token: string) => void)[];
  subscribers: Array<(token: string) => void>;
  config: {
    publicKey: null | JWK;
    tokenEndpoint: null | string;
    loginURL: null | string;
    storageKey: null | string;
    persistenceChoice: Pick<Storage, "setItem" | "getItem"> | null;
  };
};

export type GhostAuthServiceConfig = {
  publicKey: JWK | null;
  tokenEndpoint: string;
  loginURL: string;
  persistenceChoice: Pick<Storage, "setItem" | "getItem"> | null;
  storageKey: string;
};
