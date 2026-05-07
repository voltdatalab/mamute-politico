import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Button } from "./button";

const meta = {
  title: "UI/Drawer",
  component: Drawer,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Drawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Abrir drawer</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Painel inferior</DrawerTitle>
          <DrawerDescription>Texto sintético do drawer para visualização.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 text-sm text-muted-foreground">
          Área extra do conteúdo.
        </div>
      </DrawerContent>
    </Drawer>
  ),
};
