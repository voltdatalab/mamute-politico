import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./context-menu";

const meta = {
  title: "UI/ContextMenu",
  component: ContextMenu,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ContextMenu>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-28 w-full max-w-xs items-center justify-center rounded-md border border-dashed text-sm">
        Clique com o botão direito
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem>Copiar</ContextMenuItem>
        <ContextMenuItem>Editar</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};
