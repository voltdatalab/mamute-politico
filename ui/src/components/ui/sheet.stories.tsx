import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

const meta = {
  title: "UI/Sheet",
  component: Sheet,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Sheet>;

export default meta;

type Story = StoryObj<typeof meta>;

export const FromRight: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Abrir painel</Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Título lateral</SheetTitle>
          <SheetDescription>Descrição exemplo no Sheet para Storybook.</SheetDescription>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground">Área livre.</div>
      </SheetContent>
    </Sheet>
  ),
};
