import React, {useMemo} from "react";
import {Box, Text, useInput} from "ink";
import type {FormState} from "./types.js";

type SummaryStepProps = {
  state: FormState;
  onFinish: () => void;
};

export function SummaryStep({state, onFinish}: SummaryStepProps): React.JSX.Element {
  const filesToCreate = useMemo(() => {
    const items = ["environments/tools/.env"];
    if (state.pieces.reverse_proxy || state.pieces.ghost || state.pieces.ui) {
      items.push("environments/production/.env");
    }
    if (state.pieces.ui) {
      items.push("ui/.env");
    }
    if (state.pieces.api && state.apiMode === "all_together") {
      items.push("api/.env");
    }
    if (state.pieces.chatbot_backend && state.chatbotMode === "all_together") {
      items.push("chatbot_backend/.env");
    }
    return items;
  }, [state]);

  useInput((input, key) => {
    if (key.return || input.toLowerCase() === "f") {
      onFinish();
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold color="green">
        Configuração concluída
      </Text>
      <Text>Arquivos recomendados para criar/atualizar:</Text>
      {filesToCreate.map((f) => (
        <Text key={f}>- {f}</Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        {state.pieces.ui && <Text>ui/.env: defina VITE_BASE_URL={state.publicBaseUrl || "<url-publica>"}</Text>}
        {state.pieces.api && state.apiMode === "all_together" && (
          <Text>api/.env: crie a partir de api/.env.example e preencha DATABASE_URL + variáveis de auth do Ghost.</Text>
        )}
        {state.pieces.chatbot_backend && state.chatbotMode === "all_together" && (
          <Text>
            chatbot_backend/.env: crie a partir de chatbot_backend/.env.example e preencha variáveis de OPENAI/BANCO.
          </Text>
        )}
        {(state.pieces.reverse_proxy || state.pieces.ghost || state.pieces.ui) && (
          <Text>environments/production/.env: crie a partir de environments/production/.env.example.</Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Pressione Enter (ou f) para finalizar.</Text>
      </Box>
    </Box>
  );
}
