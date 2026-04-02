import type { Meta, StoryObj } from "@storybook/react";
import HistoryChart from "@/components/HistoryChart";

const meta: Meta<typeof HistoryChart> = {
  title: "Components/HistoryChart",
  component: HistoryChart,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  args: {
    entries: [],
  },
};

export const FewEntries: Story = {
  args: {
    entries: [
      {
        id: "1",
        timestamp: Date.now() - 86400000 * 3,
        score: 5,
        total: 10,
        percentage: 50,
        mode: "normal",
      },
      {
        id: "2",
        timestamp: Date.now() - 86400000 * 2,
        score: 7,
        total: 10,
        percentage: 70,
        mode: "normal",
      },
      {
        id: "3",
        timestamp: Date.now() - 86400000,
        score: 9,
        total: 10,
        percentage: 90,
        mode: "normal",
      },
    ],
  },
};

export const ManyEntries: Story = {
  args: {
    entries: Array.from({ length: 10 }, (_, i) => ({
      id: String(i + 1),
      timestamp: Date.now() - 86400000 * (10 - i),
      score: Math.floor(Math.random() * 5) + 5,
      total: 10,
      percentage: Math.floor(Math.random() * 50) + 50,
      mode: "normal" as const,
    })),
  },
};

export const WithRetryEntries: Story = {
  args: {
    entries: [
      {
        id: "1",
        timestamp: Date.now() - 86400000 * 2,
        score: 6,
        total: 10,
        percentage: 60,
        mode: "normal",
      },
      {
        id: "2",
        timestamp: Date.now() - 86400000,
        score: 3,
        total: 4,
        percentage: 75,
        mode: "retry",
      },
      {
        id: "3",
        timestamp: Date.now(),
        score: 8,
        total: 10,
        percentage: 80,
        mode: "normal",
      },
    ],
  },
};
