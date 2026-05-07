import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta = {
  title: "UI/Accordion",
  component: Accordion,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Accordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-md">
      <AccordionItem value="1">
        <AccordionTrigger>Primeiro</AccordionTrigger>
        <AccordionContent>Conteúdo do primeiro item.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionTrigger>Segundo</AccordionTrigger>
        <AccordionContent>Conteúdo do segundo item.</AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
