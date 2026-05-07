import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Calendar } from "./calendar";

const meta = {
  title: "UI/Calendar",
  component: Calendar,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Calendar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="rounded-md border bg-background p-2">
      <Calendar mode="single" selected={React.useMemo(() => new Date(2025, 4, 7), [])} />
    </div>
  ),
};
