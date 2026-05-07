import type { Meta, StoryObj } from "@storybook/react-vite";

const meta = {
  title: "UI/Toaster",
  parameters: {
    layout: "padded",
    screenshot: { disable: true },
    docs: { description: { story: "O preview já monta o Toaster uma vez." } },
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const NoteOnly: Story = {
  parameters: {
    screenshot: { disable: true },
  },
  render: () => (
    <p className="text-sm text-muted-foreground">
      Este componente é renderizado globalmente pelo preview do Storybook. Use{" "}
      <code>Sonner / TriggerToast</code> para ver notificações.
    </p>
  ),
};
