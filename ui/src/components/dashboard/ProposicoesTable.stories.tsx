import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProposicoesTable } from "./ProposicoesTable";

const meta = {
  title: "Dashboard/ProposicoesTable",
  component: ProposicoesTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProposicoesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ByParliamentarian: Story = {
  render: () => (
    <div className="max-w-6xl overflow-x-auto rounded-md border p-4">
      <ProposicoesTable parliamentarianId="1001" limit={8} />
    </div>
  ),
};
