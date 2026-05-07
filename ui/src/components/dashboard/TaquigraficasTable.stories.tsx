import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaquigraficasTable } from "./TaquigraficasTable";

const meta = {
  title: "Dashboard/TaquigraficasTable",
  component: TaquigraficasTable,
  parameters: { layout: "padded" },
} satisfies Meta<typeof TaquigraficasTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithMocks: Story = {
  render: () => (
    <div className="max-w-6xl overflow-x-auto rounded-md border p-4">
      <TaquigraficasTable parliamentarianId={1001} limit={8} />
    </div>
  ),
};
