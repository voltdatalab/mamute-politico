import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Tabs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="t1" className="max-w-lg">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="t1">Aba 1</TabsTrigger>
        <TabsTrigger value="t2">Aba 2</TabsTrigger>
        <TabsTrigger value="t3">Aba 3</TabsTrigger>
      </TabsList>
      <TabsContent value="t1" className="pt-4 text-sm">
        Conteúdo da primeira aba.
      </TabsContent>
      <TabsContent value="t2" className="pt-4 text-sm">
        Conteúdo da segunda aba.
      </TabsContent>
      <TabsContent value="t3" className="pt-4 text-sm">
        Conteúdo da terceira aba.
      </TabsContent>
    </Tabs>
  ),
};
