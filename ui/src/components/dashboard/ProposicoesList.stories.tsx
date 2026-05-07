import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProposicoesList } from "./ProposicoesList";

const meta = {
  title: "Dashboard/ProposicoesList",
  component: ProposicoesList,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ProposicoesList>;

export default meta;

type Story = StoryObj<typeof meta>;

export const ByParliamentarian: Story = {
  render: () => (
    <div className="max-w-xl">
      <ProposicoesList parliamentarianId="1001" limit={6} />
    </div>
  ),
};

export const GlobalList: Story = {
  render: () => (
    <div className="max-w-xl">
      <ProposicoesList limit={5} />
    </div>
  ),
};
