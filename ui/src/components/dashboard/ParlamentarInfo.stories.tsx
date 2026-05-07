import type { Meta, StoryObj } from "@storybook/react-vite";
import type { Parlamentar } from "@/types/parlamentar";
import { ParlamentarInfo } from "./ParlamentarInfo";

const parlamentarDemo: Parlamentar = {
  id: "1001",
  nome: "Maria Silva",
  nomeCompleto: "Maria Silva Santos",
  foto: "",
  partido: { sigla: "PT", nome: "PT" },
  uf: "SP",
  casa: "camara",
  legislatura: 57,
  email: "maria.silva@example.org",
  telefone: "(11) 3000-0000",
  gabinete: "Anexo IV — Sala 418",
  situacao: "Exercício",
};

const meta = {
  title: "Dashboard/ParlamentarInfo",
  component: ParlamentarInfo,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ParlamentarInfo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Camara: Story = {
  render: () => (
    <div className="max-w-lg">
      <ParlamentarInfo parlamentar={parlamentarDemo} />
    </div>
  ),
};
