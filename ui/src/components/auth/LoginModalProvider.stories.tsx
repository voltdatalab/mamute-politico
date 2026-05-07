import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginModalProvider } from "./LoginModalProvider";

const meta = {
  title: "Auth/LoginModalProvider",
  component: LoginModalProvider,
  parameters: { layout: "padded" },
} satisfies Meta<typeof LoginModalProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <LoginModalProvider>
      <p className="text-sm text-muted-foreground">
        Wrapper do modal de login; use <code>LoginModal</code> para estados visualmente explícitos.
      </p>
    </LoginModalProvider>
  ),
};
