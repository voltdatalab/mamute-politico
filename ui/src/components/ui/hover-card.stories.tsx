import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";

const meta = {
  title: "UI/HoverCard",
  component: HoverCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof HoverCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">Passe o mouse</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72 text-sm">
        Conteúdo exibido no hover card (dados fictícios).
      </HoverCardContent>
    </HoverCard>
  ),
};
