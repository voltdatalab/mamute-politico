import React from "react";
import {ChecklistStep} from "./ChecklistStep.js";
import {ChoiceStep} from "./ChoiceStep.js";
import {InputStep} from "./InputStep.js";
import {SummaryStep} from "./SummaryStep.js";
import {pieceLabels} from "./constants.js";
import type {FormState, SetupStepId} from "./types.js";

type SetupStepViewProps = {
  current: SetupStepId;
  state: FormState;
  cursor: number;
  setCursor: (cursor: number) => void;
  setState: (updater: (prev: FormState) => FormState) => void;
  nextStep: () => void;
  finish: () => void;
};

export function SetupStepView({
  current,
  state,
  cursor,
  setCursor,
  setState,
  nextStep,
  finish
}: SetupStepViewProps): React.JSX.Element {
  if (current === "select_pieces") {
    return (
      <ChecklistStep
        title="Selecione os componentes para configurar"
        options={pieceLabels}
        selected={state.pieces}
        cursor={cursor}
        onCursor={setCursor}
        onToggle={(id) =>
          setState((prev: FormState) => ({
            ...prev,
            pieces: {...prev.pieces, [id]: !prev.pieces[id]}
          }))
        }
        onSubmit={nextStep}
      />
    );
  }

  if (current === "api_mode") {
    return (
      <ChoiceStep
        title="Modo da API"
        value={state.apiMode === "remote" ? "remote" : "all_together"}
        options={[
          {id: "all_together", label: "Executar junto (padrão)"},
          {id: "remote", label: "Usar API remota"}
        ]}
        onChange={(v) => setState((prev: FormState) => ({...prev, apiMode: v}))}
        onSubmit={nextStep}
      />
    );
  }

  if (current === "api_remote_url") {
    return (
      <InputStep
        title="URL base da API remota"
        value={state.remoteApiBaseUrl}
        placeholder="https://api.example.com"
        onChange={(v) => setState((prev: FormState) => ({...prev, remoteApiBaseUrl: v}))}
        onSubmit={nextStep}
      />
    );
  }

  if (current === "chatbot_mode") {
    return (
      <ChoiceStep
        title="Modo do backend do chatbot"
        value={state.chatbotMode === "remote" ? "remote" : "all_together"}
        options={[
          {id: "all_together", label: "Executar junto (padrão)"},
          {id: "remote", label: "Usar backend remoto do chatbot"}
        ]}
        onChange={(v) => setState((prev: FormState) => ({...prev, chatbotMode: v}))}
        onSubmit={nextStep}
      />
    );
  }

  if (current === "chatbot_remote_url") {
    return (
      <InputStep
        title="URL base do chatbot remoto"
        value={state.remoteChatbotBaseUrl}
        placeholder="https://chat.example.com"
        onChange={(v) => setState((prev: FormState) => ({...prev, remoteChatbotBaseUrl: v}))}
        onSubmit={nextStep}
      />
    );
  }

  if (current === "public_base_url") {
    return (
      <InputStep
        title="URL base pública (usada nas validações de UI/Caddy/Ghost)"
        value={state.publicBaseUrl}
        placeholder="http://localhost"
        onChange={(v) => setState((prev: FormState) => ({...prev, publicBaseUrl: v}))}
        onSubmit={nextStep}
      />
    );
  }

  return <SummaryStep state={state} onFinish={finish} />;
}
