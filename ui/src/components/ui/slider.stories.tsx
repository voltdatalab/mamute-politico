import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-72 space-y-2">
      <p className="text-sm text-muted-foreground">Valor aproximado</p>
      <Slider defaultValue={[35]} max={100} step={1} />
    </div>
  ),
};
