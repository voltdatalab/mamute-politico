import axios from "axios";
import type { GhostAuthStateWrapper } from "./types";

/**
 * Fetches a new JWT from Ghost Members session endpoint.
 * Requires the Ghost server to allow CORS with credentials from this app's origin
 * (Access-Control-Allow-Origin: <app origin>, Access-Control-Allow-Credentials: true).
 * Wildcard origin is not allowed when credentials is true.
 */
export async function requestNewToken(
  stateWrapper: GhostAuthStateWrapper
): Promise<string> {
  if (!stateWrapper.config.tokenEndpoint) {
    throw new Error('Missing "tokenEndpoint" in configuration');
  }
  const newTokenResponse = await axios.get<string>(
    stateWrapper.config.tokenEndpoint,
    { withCredentials: true, responseType: "text" }
  );
  if (newTokenResponse.status !== 200) {
    throw new Error("Token response was not successful");
  }
  return newTokenResponse.data;
}
