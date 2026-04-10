import { publicKey } from "./publicKey";

// TODO: Use VITE_API_BASE_URL?
export const AUTH_API_ROOT =
  (import.meta.env.VITE_AUTH_API_ROOT as string | undefined) ??
  "http://localhost";
export const TOKEN_ENDPOINT = `${AUTH_API_ROOT}/members/api/session/`;
export const WELL_KNOWN_ENDPOINT = `${AUTH_API_ROOT}/members/.well-known/jwks.json`;

export const JWT_TOKEN_KEY = "mamutePoliticoJwtToken";
export const LOGIN_URL = `${AUTH_API_ROOT}/#/portal/signin`;
export const ACCOUNT_URL = `${AUTH_API_ROOT}/#/portal/account`;
export const SIGNUP_URL = `${AUTH_API_ROOT}/#/portal/signup`;

const tokenPersistenceChoice =
  typeof window !== "undefined"
    ? localStorage
    : { setItem: () => null, getItem: () => null };

export const ghostClientConfig = {
  publicKey,
  tokenEndpoint: TOKEN_ENDPOINT,
  loginURL: LOGIN_URL,
  persistenceChoice: tokenPersistenceChoice,
  storageKey: JWT_TOKEN_KEY,
};
