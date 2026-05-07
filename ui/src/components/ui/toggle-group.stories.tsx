import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ToggleGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="b" className="justify-start">
      <ToggleGroupItem value="a" aria-label="A">
        A
      </ToggleGroupItem>
      <ToggleGroupItem value="b" aria-label="B">
        B
      </ToggleGroupItem>
      <ToggleGroupItem value="c" aria-label="C">
        C
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};
