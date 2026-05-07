import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import type { CasaLegislativa } from "@/types/parlamentar";
import { CongressoSelector } from "./CongressoSelector";

const meta = {
  title: "Selecao/CongressoSelector",
  component: CongressoSelector,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof CongressoSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: () => {
    const [selected, setSelected] = React.useState<CasaLegislativa | null>("camara");
    return <CongressoSelector selected={selected} onSelect={setSelected} />;
  },
};
