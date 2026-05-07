import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Toast,
  ToastAction,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "./toast";

const meta = {
  title: "UI/Toast",
  component: Toast,
  parameters: {
    screenshot: { disable: true },
  },
} satisfies Meta<typeof Toast>;

export default meta;

type Story = StoryObj<typeof meta>;

export const StaticSample: Story = {
  parameters: {
    screenshot: { disable: true },
  },
  render: () => (
    <ToastProvider>
      <Toast>
        <div className="grid gap-1">
          <ToastTitle>Notificação</ToastTitle>
          <ToastDescription>Mensagem de exemplo no primário toast.</ToastDescription>
        </div>
        <ToastAction altText="Aceitar">OK</ToastAction>
        <ToastClose />
      </Toast>
      <ToastViewport />
    </ToastProvider>
  ),
};
