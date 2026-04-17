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
    if (state.pieces.app_stack || state.pieces.database) {
      items.push("environments/production/.env");
    }
    if (state.pieces.app_stack) {
      items.push("ui/.env");
    }
    if (state.pieces.app_stack && state.apiMode === "all_together") {
      items.push("api/.env");
    }
    if (state.pieces.app_stack && state.chatbotMode === "all_together") {
      items.push("chatbot_backend/.env");
    }
    if (state.pieces.scrappers) {
      items.push("mamute_scrappers/.env");
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
        {state.pieces.app_stack && (
          <Text>ui/.env: defina VITE_BASE_URL={state.publicBaseUrl || "<url-publica>"}</Text>
        )}
        {state.pieces.app_stack && state.apiMode === "all_together" && (
          <Text>api/.env: crie a partir de api/.env.example e preencha DATABASE_URL + variáveis de auth do Ghost.</Text>
        )}
        {state.pieces.app_stack && state.chatbotMode === "all_together" && (
          <Text>
            chatbot_backend/.env: crie a partir de chatbot_backend/.env.example e preencha variáveis de OPENAI/BANCO.
          </Text>
        )}
        {state.pieces.scrappers && (
          <Text>mamute_scrappers/.env: crie a partir de mamute_scrappers/.env.example.</Text>
        )}
        {(state.pieces.app_stack || state.pieces.database) && (
          <Text>environments/production/.env: crie a partir de environments/production/.env.example.</Text>
        )}
        {state.pieces.database && (
          <Text>Banco de dados ativa somente pgvector-db; ghost-db sempre acompanha o grupo do app stack.</Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Pressione Enter (ou f) para finalizar.</Text>
      </Box>
    </Box>
  );
}
