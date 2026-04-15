import React from "react";
import {Box, Text, useInput} from "ink";

type InputStepProps = {
  title: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
};

export function InputStep({title, value, placeholder, onChange, onSubmit}: InputStepProps): React.JSX.Element {
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
