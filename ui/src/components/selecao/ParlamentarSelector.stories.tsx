import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import type { Parlamentar } from "@/types/parlamentar";
import { ParlamentarSelector } from "./ParlamentarSelector";

const seeded: Parlamentar[] = [
  {
    id: "9999",
    nome: "Fulano Monitorado",
    nomeCompleto: "Fulano Monitorado Silva",
    foto: "",
    partido: { sigla: "PSOL", nome: "PSOL" },
    uf: "RJ",
    casa: "camara",
    legislatura: 57,
    situacao: "Exercício",
  },
];

const meta = {
  title: "Selecao/ParlamentarSelector",
  component: ParlamentarSelector,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ParlamentarSelector>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Camara: Story = {
  render: () => {
    const [sel, setSel] = React.useState<Parlamentar[]>(seeded);
    return (
      <ParlamentarSelector
        casaSelecionada="camara"
        parlamentaresSelecionados={sel}
        onAddParlamentar={(p) => setSel((s) => (s.some((x) => x.id === p.id) ? s : [...s, p]))}
        onRemoveParlamentar={(id) => setSel((s) => s.filter((x) => x.id !== id))}
      />
    );
  },
};
