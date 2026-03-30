import { useSyncExternalStore } from "react";
import { createGhostAuthService } from "../createGhostAuthService";
import { ghostClientConfig } from "../../config";

const ghostService = createGhostAuthService(ghostClientConfig);

export function useGhostAuth(): string | null {
  return useSyncExternalStore(
    ghostService.subscribe,
    ghostService.getSnapshot,
    ghostService.getSnapshot
  );
}
