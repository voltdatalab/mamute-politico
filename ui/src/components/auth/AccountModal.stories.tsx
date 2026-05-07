import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { AccountModal } from "./AccountModal";

const meta = {
  title: "Auth/AccountModal",
  component: AccountModal,
  parameters: {
    layout: "centered",
    screenshot: { disable: true },
  },
} satisfies Meta<typeof AccountModal>;

export default meta;

type Story = StoryObj<typeof meta>;

export const OpenLoadsMember: Story = {
  parameters: {
    screenshot: { disable: true },
  },
  render: () => {
    const [open, setOpen] = React.useState(true);
    return <AccountModal open={open} onOpenChange={setOpen} launchKey={1} />;
  },
};
