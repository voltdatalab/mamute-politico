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
  {id: "reverse_proxy", label: "Reverse proxy (Caddy)"},
  {id: "api", label: "API"},
  {id: "chatbot_backend", label: "Chatbot backend"},
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
      <Text dimColor>Use arrows, space to toggle, Enter to continue.</Text>
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
      <Text dimColor>Use arrows and Enter.</Text>
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
      <Text dimColor>Type value and press Enter.</Text>
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
  const output = useMemo(() => buildEnvOutput(state), [state]);
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
        Setup complete
      </Text>
      <Text>Recommended files to create/update:</Text>
      {filesToCreate.map((f) => (
        <Text key={f}>- {f}</Text>
      ))}

      <Box marginTop={1} flexDirection="column">
        <Text bold>tools/.env contents:</Text>
        {output.split("\n").map((line) => (
          <Text key={line}>{line}</Text>
        ))}
      </Box>

      <Box marginTop={1} flexDirection="column">
        {state.pieces.ui && <Text>ui/.env: set VITE_BASE_URL={state.publicBaseUrl || "<public-url>"}</Text>}
        {state.pieces.api && state.apiMode === "all_together" && (
          <Text>api/.env: create from api/.env.example and fill DATABASE_URL + Ghost auth vars.</Text>
        )}
        {state.pieces.chatbot_backend && state.chatbotMode === "all_together" && (
          <Text>
            chatbot_backend/.env: create from chatbot_backend/.env.example and fill OPENAI/DATABASE vars.
          </Text>
        )}
        {(state.pieces.reverse_proxy || state.pieces.ghost || state.pieces.ui) && (
          <Text>environments/production/.env: create from environments/production/.env.example.</Text>
        )}
      </Box>
      <Box marginTop={1}>
        <Text dimColor>Press Enter (or f) to finish.</Text>
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
            title="Select pieces to configure"
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
            title="API mode"
            value={state.apiMode === "remote" ? "remote" : "all_together"}
            options={[
              {id: "all_together", label: "Run together (default)"},
              {id: "remote", label: "Use remote API"}
            ]}
            onChange={(v) => setState((prev) => ({...prev, apiMode: v}))}
            onSubmit={() => setStep((s) => s + 1)}
          />
        );
      }

      if (current === "api_remote_url") {
        return (
          <InputStep
            title="Remote API base URL"
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
            title="Chatbot backend mode"
            value={state.chatbotMode === "remote" ? "remote" : "all_together"}
            options={[
              {id: "all_together", label: "Run together (default)"},
              {id: "remote", label: "Use remote chatbot backend"}
            ]}
            onChange={(v) => setState((prev) => ({...prev, chatbotMode: v}))}
            onSubmit={() => setStep((s) => s + 1)}
          />
        );
      }

      if (current === "chatbot_remote_url") {
        return (
          <InputStep
            title="Remote chatbot base URL"
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
            title="Public base URL (used by UI/Caddy/Ghost checks)"
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
    console.log("Setup cancelled.");
    return;
  }

  const output = buildEnvOutput(result.values);
  console.log("Suggested environments/tools/.env content:");
  console.log(output);
  console.log("");
  console.log("Create/update these files based on your selected options:");
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
