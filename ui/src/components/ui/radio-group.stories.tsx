import type { Meta, StoryObj } from "@storybook/react-vite";
import { Label } from "./label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: { layout: "padded" },
} satisfies Meta<typeof RadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="r1" />
        <Label htmlFor="r1">Opção A</Label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="r2" />
        <Label htmlFor="r2">Opção B</Label>
      </div>
    </RadioGroup>
  ),
};
