import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { type ChartConfig, ChartContainer } from "./chart";

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  parameters: { layout: "padded" },
} satisfies Meta<typeof ChartContainer>;

export default meta;

type Story = StoryObj<typeof meta>;

const chartConfig = {
  valor: {
    label: "Valor",
    color: "hsl(220 80% 50%)",
  },
} satisfies ChartConfig;

const chartData = [
  { mês: "Jan", valor: 8 },
  { mês: "Fev", valor: 12 },
  { mês: "Mar", valor: 6 },
];

export const BarSample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-52 w-full max-w-xl">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="mês" />
        <Bar dataKey="valor" fill="var(--color-valor)" radius={6} />
      </BarChart>
    </ChartContainer>
  ),
};
