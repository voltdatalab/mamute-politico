import React, {useState} from "react";
import {render, useApp, useInput} from "ink";
import {ChecklistStep} from "./setup/ChecklistStep.js";
import {ChoiceStep} from "./setup/ChoiceStep.js";
import {InputStep} from "./setup/InputStep.js";
import {SummaryStep} from "./setup/SummaryStep.js";
import {pieceLabels} from "./setup/constants.js";
import type {FormState, SetupResult} from "./setup/types.js";
import {buildEnvOutput} from "./setup/utils.js";

export async function runSetup(): Promise<void> {
  const result = await new Promise<SetupResult>((resolve) => {
    const App = () => {
      const {exit} = useApp();
      const [step, setStep] = useState(0);
      const [cursor, setCursor] = useState(0);
      const [state, setState] = useState<FormState>({
        pieces: {
          ui: true,
          reverse_proxy: true,
          api: true,
          chatbot_backend: true,
          ghost: true
        },
        apiMode: "all_together",
        remoteApiBaseUrl: "",
        chatbotMode: "all_together",
        remoteChatbotBaseUrl: "",
        publicBaseUrl: "http://localhost"
      });
      const steps = [
        "select_pieces",
        ...(state.pieces.api ? ["api_mode"] : []),
        ...(state.pieces.api && state.apiMode === "remote" ? ["api_remote_url"] : []),
        ...(state.pieces.chatbot_backend ? ["chatbot_mode"] : []),
        ...(state.pieces.chatbot_backend && state.chatbotMode === "remote" ? ["chatbot_remote_url"] : []),
        "public_base_url",
        "summary"
      ] as const;
      const current = steps[Math.min(step, steps.length - 1)];

      useInput((input: string, key: {ctrl?: boolean}) => {
        if (input === "q" || input === "Q" || (key.ctrl && input === "c")) {
          resolve({values: state, cancelled: true});
          exit();
        }
      });

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
            onSubmit={() => setStep((s: number) => s + 1)}
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
            onSubmit={() => setStep((s: number) => s + 1)}
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
            onSubmit={() => setStep((s: number) => s + 1)}
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
            onSubmit={() => setStep((s: number) => s + 1)}
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
            onSubmit={() => setStep((s: number) => s + 1)}
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
            onSubmit={() => setStep((s: number) => s + 1)}
          />
        );
      }

      return (
        <SummaryStep
          state={state}
          onFinish={() => {
            resolve({values: state, cancelled: false});
            exit();
          }}
        />
      );
    };

    render(<App />, {exitOnCtrlC: true});
  });

  if (result.cancelled) {
    console.log("Configuração cancelada.");
    return;
  }

  const output = buildEnvOutput(result.values);
  console.log("Conteúdo sugerido para environments/tools/.env:");
  console.log("--------");
  console.log(output);
  console.log("--------");
  console.log("");
  console.log("Crie/atualize estes arquivos com base nas opções selecionadas:");
  console.log("- environments/tools/.env");
  if (result.values.pieces.reverse_proxy || result.values.pieces.ghost || result.values.pieces.ui) {
    console.log("- environments/production/.env");
  }
  if (result.values.pieces.ui) {
    console.log("- ui/.env");
  }
  if (result.values.pieces.api && result.values.apiMode === "all_together") {
    console.log("- api/.env");
  }
  if (result.values.pieces.chatbot_backend && result.values.chatbotMode === "all_together") {
    console.log("- chatbot_backend/.env");
  }
}
