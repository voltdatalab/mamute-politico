import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "./scroll-area";

const meta = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ScrollArea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ScrollArea className="h-40 w-64 rounded-md border p-3">
      <div className="space-y-2 text-sm">
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>Linha {i + 1} de conteúdo rolável.</p>
        ))}
      </div>
    </ScrollArea>
  ),
};
