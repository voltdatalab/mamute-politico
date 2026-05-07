import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta = {
  title: "UI/Avatar",
  component: Avatar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Avatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Fallback: Story = {
  render: () => (
    <Avatar className="h-14 w-14">
      <AvatarImage alt="" />
      <AvatarFallback>MP</AvatarFallback>
    </Avatar>
  ),
};
