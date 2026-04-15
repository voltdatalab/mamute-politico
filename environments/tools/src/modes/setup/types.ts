export type PieceId = "ui" | "reverse_proxy" | "api" | "chatbot_backend" | "ghost";

export type FormState = {
  pieces: Record<PieceId, boolean>;
  apiMode: "all_together" | "remote";
  remoteApiBaseUrl: string;
  chatbotMode: "all_together" | "remote";
  remoteChatbotBaseUrl: string;
  publicBaseUrl: string;
};

export type SetupResult = {
  values: FormState;
  cancelled: boolean;
};
