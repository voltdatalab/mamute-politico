import React from "react";
import {Box, Text, useInput} from "ink";

type Choice = {id: "all_together" | "remote"; label: string};

type ChoiceStepProps = {
  title: string;
  options: Choice[];
  value: "all_together" | "remote";
  onChange: (v: "all_together" | "remote") => void;
  onSubmit: () => void;
};

export function ChoiceStep({title, options, value, onChange, onSubmit}: ChoiceStepProps): React.JSX.Element {
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
