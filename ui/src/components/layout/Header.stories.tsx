import type { Meta, StoryObj } from "@storybook/react-vite";
import { Header } from "./Header";

const meta = {
  title: "Layout/Header",
  component: Header,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Header>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Embedded: Story = {
  render: () => (
    <div className="min-h-[220px] bg-background">
      <Header />
      <main className="p-6 text-sm text-muted-foreground">Área sob o cabeçalho.</main>
    </div>
  ),
};
