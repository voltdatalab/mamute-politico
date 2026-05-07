import type { Meta, StoryObj } from "@storybook/react-vite";
import { SelecaoFooter } from "./SelecaoFooter";

const meta = {
  title: "Selecao/SelecaoFooter",
  component: SelecaoFooter,
  parameters: { layout: "padded" },
} satisfies Meta<typeof SelecaoFooter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-full overflow-hidden rounded-md ring-1 ring-border">
      <SelecaoFooter />
    </div>
  ),
};
