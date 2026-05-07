import type { Meta, StoryObj } from "@storybook/react-vite";
import { toast } from "sonner";
import { Button } from "./button";

const meta = {
  title: "UI/Sonner",
  component: Button,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

export const TriggerToast: Story = {
  render: () => (
    <Button type="button" size="sm" onClick={() => toast("Olá Storybook")}>
      Disparar toast
    </Button>
  ),
};
