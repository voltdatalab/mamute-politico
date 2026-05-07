import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavLink } from "./NavLink";

const meta = {
  title: "Layout/NavLink",
  component: NavLink,
  parameters: { layout: "padded" },
} satisfies Meta<typeof NavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "font-bold underline" : "text-primary underline")}>
      Ir ao dashboard fictício
    </NavLink>
  ),
};
