import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Button } from "./button";

const meta = {
  title: "UI/Collapsible",
  component: Collapsible,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Collapsible>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-72 rounded-md border px-4 py-2">
      <CollapsibleTrigger asChild>
        <Button variant="ghost" className="w-full justify-start p-0">
          Alternar
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2 text-sm text-muted-foreground">
        Conteúdo recolhível para demonstração.
      </CollapsibleContent>
    </Collapsible>
  ),
};
