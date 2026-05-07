import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./aspect-ratio";

const meta = {
  title: "UI/AspectRatio",
  component: AspectRatio,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AspectRatio>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SixteenNine: Story = {
  render: () => (
    <div className="w-72">
      <AspectRatio ratio={16 / 9}>
        <div className="flex h-full items-center justify-center bg-muted text-sm">16×9</div>
      </AspectRatio>
    </div>
  ),
};
