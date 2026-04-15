import React from "react";
import {Box, Text, useInput} from "ink";
import type {PieceId} from "./types.js";

type ChecklistStepProps = {
  title: string;
  options: Array<{id: PieceId; label: string}>;
  selected: Record<PieceId, boolean>;
  cursor: number;
  onCursor: (next: number) => void;
  onToggle: (id: PieceId) => void;
  onSubmit: () => void;
};

export function ChecklistStep({
  title,
  options,
  selected,
  cursor,
  onCursor,
  onToggle,
  onSubmit
}: ChecklistStepProps): React.JSX.Element {
  useInput((input, key) => {
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

    if (input.toLowerCase() === " ") {
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
