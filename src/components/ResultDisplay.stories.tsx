import type { Meta, StoryObj } from "@storybook/react";
import ResultDisplay from "@/components/ResultDisplay";

const meta: Meta<typeof ResultDisplay> = {
  title: "Components/ResultDisplay",
  component: ResultDisplay,
  args: {
    onRetry: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PerfectScore: Story = {
  args: {
    score: 10,
    total: 10,
    onRetryWrong: undefined,
  },
};

export const HighScore: Story = {
  args: {
    score: 9,
    total: 10,
    onRetryWrong: () => {},
  },
};

export const MediumScore: Story = {
  args: {
    score: 7,
    total: 10,
    onRetryWrong: () => {},
  },
};

export const LowScore: Story = {
  args: {
    score: 3,
    total: 10,
    onRetryWrong: () => {},
  },
};

export const ZeroScore: Story = {
  args: {
    score: 0,
    total: 10,
    onRetryWrong: () => {},
  },
};

export const RetryMode: Story = {
  args: {
    score: 3,
    total: 5,
    mode: "retry",
    onRetryWrong: () => {},
  },
};

export const NoWrongAnswers: Story = {
  args: {
    score: 8,
    total: 10,
    onRetryWrong: undefined,
  },
};
