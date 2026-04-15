import React, {useMemo, useState} from "react";
import {Box, Text, render, useApp, useInput} from "ink";

type PieceId = "ui" | "reverse_proxy" | "api" | "chatbot_backend" | "ghost";

type FormState = {
  pieces: Record<PieceId, boolean>;
  apiMode: "all_together" | "remote";
  remoteApiBaseUrl: string;
  chatbotMode: "all_together" | "remote";
  remoteChatbotBaseUrl: string;
  publicBaseUrl: string;
};

type SetupResult = {
  values: FormState;
  cancelled: boolean;
};

const pieceLabels: Array<{id: PieceId; label: string}> = [
  {id: "ui", label: "UI"},
  {id: "reverse_proxy", label: "Proxy reverso (Caddy)"},
  {id: "api", label: "API"},
  {id: "chatbot_backend", label: "Backend do chatbot"},
  {id: "ghost", label: "Ghost"}
];

function ChecklistStep({
  title,
  options,
  selected,
  cursor,
  onCursor,
  onToggle,
  onSubmit
}: {
  title: string;
  options: Array<{id: PieceId; label: string}>;
  selected: Record<PieceId, boolean>;
  cursor: number;
  onCursor: (next: number) => void;
  onToggle: (id: PieceId) => void;
  onSubmit: () => void;
}): React.JSX.Element {
  useInput((_, key) => {
    if (key.upArrow) {
      onCursor((cursor - 1 + options.length) % options.length);
      return;
    }

    if (key.downArrow) {
      onCursor((cursor + 1) % options.length);
      return;
    }

    if (key.return) {
      onSubmit();
      return;
    }

    if (_.toLowerCase() === " ") {
      onToggle(options[cursor].id);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Text dimColor>Use as setas, espaço para marcar e Enter para continuar.</Text>
      <Box marginTop={1} flexDirection="column">
        {options.map((option, index) => {
          const focused = index === cursor;
          const mark = selected[option.id] ? "✓" : " ";
          return (
            <Text key={option.id} color={focused ? "green" : undefined}>
              {focused ? ">" : " "} [{mark}] {option.label}
            </Text>
          );
        })}
      </Box>
    </Box>
  );
}

function ChoiceStep({
  title,
  options,
  value,
  onChange,
  onSubmit
}: {
  title: string;
  options: Array<{id: "all_together" | "remote"; label: string}>;
  value: "all_together" | "remote";
  onChange: (v: "all_together" | "remote") => void;
  onSubmit: () => void;
}): React.JSX.Element {
  const cursor = options.findIndex((o) => o.id === value);

  useInput((_, key) => {
    if (key.upArrow || key.leftArrow) {
      const prev = (cursor - 1 + options.length) % options.length;
      onChange(options[prev].id);
      return;
    }

    if (key.downArrow || key.rightArrow) {
      const next = (cursor + 1) % options.length;
      onChange(options[next].id);
      return;
    }

    if (key.return) {
      onSubmit();
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Text dimColor>Use as setas e Enter.</Text>
      <Box marginTop={1} flexDirection="column">
        {options.map((option) => (
          <Text key={option.id} color={option.id === value ? "green" : undefined}>
            {option.id === value ? ">" : " "} {option.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
}

function InputStep({
  title,
  value,
  placeholder,
  onChange,
  onSubmit
}: {
  title: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
}): React.JSX.Element {
  useInput((input, key) => {
    if (key.return) {
      onSubmit();
      return;
    }

    if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
      return;
    }

    if (key.ctrl || key.meta) {
      return;
    }

    if (input.length > 0) {
      onChange(value + input);
    }
  });

  return (
    <Box flexDirection="column">
      <Text bold>{title}</Text>
      <Text dimColor>Digite o valor e pressione Enter.</Text>
      <Box marginTop={1}>
        <Text color="cyan">{value.length > 0 ? value : placeholder}</Text>
      </Box>
    </Box>
  );
}

function buildEnvOutput(state: FormState): string {
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

function SummaryStep({state, onFinish}: {state: FormState; onFinish: () => void}): React.JSX.Element {
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

      useInput((input, key) => {
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
              setState((prev) => ({
                ...prev,
                pieces: {...prev.pieces, [id]: !prev.pieces[id]}
              }))
            }
            onSubmit={() => setStep((s) => s + 1)}
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
            onChange={(v) => setState((prev) => ({...prev, apiMode: v}))}
            onSubmit={() => setStep((s) => s + 1)}
          />
        );
      }

      if (current === "api_remote_url") {
        return (
          <InputStep
            title="URL base da API remota"
            value={state.remoteApiBaseUrl}
            placeholder="https://api.example.com"
            onChange={(v) => setState((prev) => ({...prev, remoteApiBaseUrl: v}))}
            onSubmit={() => setStep((s) => s + 1)}
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
            onChange={(v) => setState((prev) => ({...prev, chatbotMode: v}))}
            onSubmit={() => setStep((s) => s + 1)}
          />
        );
      }

      if (current === "chatbot_remote_url") {
        return (
          <InputStep
            title="URL base do chatbot remoto"
            value={state.remoteChatbotBaseUrl}
            placeholder="https://chat.example.com"
            onChange={(v) => setState((prev) => ({...prev, remoteChatbotBaseUrl: v}))}
            onSubmit={() => setStep((s) => s + 1)}
          />
        );
      }

      if (current === "public_base_url") {
        return (
          <InputStep
            title="URL base pública (usada nas validações de UI/Caddy/Ghost)"
            value={state.publicBaseUrl}
            placeholder="http://localhost"
            onChange={(v) => setState((prev) => ({...prev, publicBaseUrl: v}))}
            onSubmit={() => setStep((s) => s + 1)}
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
