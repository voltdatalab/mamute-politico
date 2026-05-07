import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Separator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Vertical: Story = {
  render: () => (
    <div className="flex h-20 items-center">
      <span className="text-sm">Esquerda</span>
      <Separator orientation="vertical" className="mx-3 h-full" />
      <span className="text-sm">Direita</span>
    </div>
  ),
};
