import type {FormState} from "./types.js";

export function buildEnvOutput(state: FormState): string {
  const lines: string[] = [];
  lines.push("ACTIVE_APP_STACK=" + String(state.pieces.app_stack));
  lines.push("ACTIVE_SCRAPPERS=" + String(state.pieces.scrappers));
  lines.push("ACTIVE_DATABASE=" + String(state.pieces.database));
  lines.push("API_MODE=" + state.apiMode);
  lines.push(
    "REMOTE_API_BASE_URL=" + (state.pieces.app_stack && state.apiMode === "remote" ? state.remoteApiBaseUrl : "")
  );
  lines.push("CHATBOT_MODE=" + state.chatbotMode);
  lines.push(
    "REMOTE_CHATBOT_BASE_URL=" +
      (state.pieces.app_stack && state.chatbotMode === "remote" ? state.remoteChatbotBaseUrl : "")
  );
  lines.push("PUBLIC_BASE_URL=" + state.publicBaseUrl);
  return lines.join("\n");
}
