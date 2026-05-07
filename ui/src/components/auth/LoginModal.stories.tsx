import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { LoginModal } from "./LoginModal";

const meta = {
  title: "Auth/LoginModal",
  component: LoginModal,
  parameters: { layout: "centered" },
} satisfies Meta<typeof LoginModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const SignInOpen: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <LoginModal
        open={open}
        onOpenChange={setOpen}
        launchKey={1}
        initialTab="signin"
        initialEmail=""
      />
    );
  },
};
