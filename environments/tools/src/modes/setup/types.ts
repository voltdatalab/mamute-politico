export type PieceId = "app_stack" | "scrappers" | "database";

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

export type SetupStepId =
  | "select_pieces"
  | "api_mode"
  | "api_remote_url"
  | "chatbot_mode"
  | "chatbot_remote_url"
  | "public_base_url"
  | "summary";
