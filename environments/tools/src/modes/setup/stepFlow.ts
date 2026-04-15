import type {FormState, SetupStepId} from "./types.js";

export function getSetupSteps(state: FormState): SetupStepId[] {
  return [
    "select_pieces",
    ...(state.pieces.api ? (["api_mode"] as const) : []),
    ...(state.pieces.api && state.apiMode === "remote" ? (["api_remote_url"] as const) : []),
    ...(state.pieces.chatbot_backend ? (["chatbot_mode"] as const) : []),
    ...(state.pieces.chatbot_backend && state.chatbotMode === "remote"
      ? (["chatbot_remote_url"] as const)
      : []),
    "public_base_url",
    "summary"
  ];
}

export function getCurrentStep(state: FormState, stepIndex: number): SetupStepId {
  const steps = getSetupSteps(state);
  return steps[Math.min(stepIndex, steps.length - 1)];
}
