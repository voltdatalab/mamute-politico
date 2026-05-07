import type { Meta, StoryObj } from "@storybook/react-vite";
import { WordCloud } from "./WordCloud";

const meta = {
  title: "Dashboard/WordCloud",
  component: WordCloud,
  parameters: { layout: "padded" },
} satisfies Meta<typeof WordCloud>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithMocks: Story = {
  render: () => (
    <div className="h-72 w-full max-w-4xl rounded-md border p-4">
      <WordCloud parliamentarianId={1001} parlamentarNome="Maria Silva" />
    </div>
  ),
};
