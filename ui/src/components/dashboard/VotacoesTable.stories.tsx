import type { Meta, StoryObj } from "@storybook/react-vite";
import { VotacoesTable } from "./VotacoesTable";

const meta = {
  title: "Dashboard/VotacoesTable",
  component: VotacoesTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof VotacoesTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithMocks: Story = {
  render: () => (
    <div className="max-w-6xl overflow-x-auto rounded-md border p-4">
      <VotacoesTable parliamentarianId={1001} limit={8} />
    </div>
  ),
};
