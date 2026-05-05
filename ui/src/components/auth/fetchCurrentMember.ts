import axios from "axios";
import { GHOST_VERSION, MEMBER_ENDPOINT, TOKEN_ENDPOINT } from "./config";

const membersApiHeaders = {
  "app-pragma": "no-cache",
  "x-ghost-version": GHOST_VERSION,
} as const;

export type CurrentMember = {
  name: string | null;
  email: string;
  uuid: string;
  status?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Returns the signed-in Ghost member, or null if no session (204 / empty).
 */
export async function fetchCurrentMember(
  signal?: AbortSignal
): Promise<CurrentMember | null> {
  const res = await axios.get<unknown>(MEMBER_ENDPOINT, {
    withCredentials: true,
    headers: { ...membersApiHeaders },
    signal,
    validateStatus: (status) =>
      status === 200 || status === 204 || status === 401,
  });

  if (res.status === 204 || res.status === 401) {
    return null;
  }

  const data = res.data;
  if (!isRecord(data)) {
    return null;
  }

  const email = typeof data.email === "string" ? data.email : "";
  const uuid = typeof data.uuid === "string" ? data.uuid : "";
  if (!email || !uuid) {
    return null;
  }

  const name =
    typeof data.name === "string" && data.name.trim() !== ""
      ? data.name
      : null;

  const status = typeof data.status === "string" ? data.status : undefined;

  return { name, email, uuid, status };
}

/**
 * Invalidates the Ghost member session cookie (this device only).
 */
export async function signOut(): Promise<void> {
  const res = await axios.delete(TOKEN_ENDPOINT, {
    withCredentials: true,
    headers: { ...membersApiHeaders },
    validateStatus: () => true,
  });

  if (res.status === 204 || res.status === 200) {
    return;
  }

  const err = new Error("Não foi possível encerrar a sessão no servidor");
  (err as Error & { status?: number }).status = res.status;
  throw err;
}
