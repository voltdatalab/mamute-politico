import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountModalProvider } from "./AccountModalProvider";

const meta = {
  title: "Auth/AccountModalProvider",
  component: AccountModalProvider,
  parameters: { layout: "padded" },
} satisfies Meta<typeof AccountModalProvider>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AccountModalProvider>
      <p className="text-sm text-muted-foreground">
        Wrapper do fluxo da conta; use <code>AccountModal</code> quando precisar forçar o diálogo
        visível para captura pontual de tela (com servidor mockado).
      </p>
    </AccountModalProvider>
  ),
};
