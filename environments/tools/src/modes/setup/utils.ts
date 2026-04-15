import type {FormState} from "./types.js";

export function buildEnvOutput(state: FormState): string {
  const lines: string[] = [];
  lines.push("ACTIVE_UI=" + String(state.pieces.ui));
  lines.push("ACTIVE_REVERSE_PROXY=" + String(state.pieces.reverse_proxy));
  lines.push("ACTIVE_API=" + String(state.pieces.api));
  lines.push("API_MODE=" + state.apiMode);
  lines.push("REMOTE_API_BASE_URL=" + (state.apiMode === "remote" ? state.remoteApiBaseUrl : ""));
  lines.push("ACTIVE_CHATBOT=" + String(state.pieces.chatbot_backend));
  lines.push("CHATBOT_MODE=" + state.chatbotMode);
  lines.push(
    "REMOTE_CHATBOT_BASE_URL=" + (state.chatbotMode === "remote" ? state.remoteChatbotBaseUrl : "")
  );
  lines.push("ACTIVE_GHOST=" + String(state.pieces.ghost));
  lines.push("PUBLIC_BASE_URL=" + state.publicBaseUrl);
  return lines.join("\n");
}
