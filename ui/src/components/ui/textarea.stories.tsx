import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Textarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="grid w-96 gap-2">
      <Label htmlFor="ta">Descrição</Label>
      <Textarea id="ta" placeholder="Digite texto longo…" rows={6} />
    </div>
  ),
};
