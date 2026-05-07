import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "./Timeline";

const meta = {
  title: "Dashboard/Timeline",
  component: Timeline,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Timeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithMocks: Story = {
  render: () => (
    <div className="max-w-2xl">
      <Timeline />
    </div>
  ),
};
