import React, {useState} from "react";
import {render, useApp, useInput} from "ink";
import type {FormState, SetupResult} from "./setup/types.js";
import {buildEnvOutput} from "./setup/utils.js";
import {SetupStepView} from "./setup/SetupStepView.js";
import {getCurrentStep} from "./setup/stepFlow.js";

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
      const current = getCurrentStep(state, step);
      const nextStep = () => setStep((s: number) => s + 1);
      const finish = () => {
        resolve({values: state, cancelled: false});
        exit();
      };

      useInput((input: string, key: {ctrl?: boolean}) => {
        if (input === "q" || input === "Q" || (key.ctrl && input === "c")) {
          resolve({values: state, cancelled: true});
          exit();
        }
      });

      return (
        <SetupStepView
          current={current}
          state={state}
          cursor={cursor}
          setCursor={setCursor}
          setState={(updater) => setState(updater)}
          nextStep={nextStep}
          finish={finish}
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
