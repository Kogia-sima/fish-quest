import type { Meta, StoryObj } from "@storybook/react";
import QuizCard from "@/components/QuizCard";

const sampleFish = {
  name: "マダイ",
  category: "タイの仲間",
  classification: "タイ科",
  image_url: null,
  detail_url: null,
  image_filename: "40K.jpg",
  rarity: 2,
};

const meta: Meta<typeof QuizCard> = {
  title: "Components/QuizCard",
  component: QuizCard,
  args: {
    fish: sampleFish,
    currentIndex: 0,
    totalQuestions: 10,
    userAnswer: "",
    isAnswered: false,
    isCorrect: null,
    onAnswerChange: () => {},
    onSubmit: () => {},
    onNext: () => {},
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Unanswered: Story = {};

export const WithInput: Story = {
  args: {
    userAnswer: "マダイ",
  },
};

export const CorrectAnswer: Story = {
  args: {
    userAnswer: "マダイ",
    isAnswered: true,
    isCorrect: true,
  },
};

export const WrongAnswer: Story = {
  args: {
    userAnswer: "サンマ",
    isAnswered: true,
    isCorrect: false,
  },
};

export const LastQuestion: Story = {
  args: {
    currentIndex: 9,
    totalQuestions: 10,
    userAnswer: "マダイ",
    isAnswered: true,
    isCorrect: true,
  },
};

export const MiddleProgress: Story = {
  args: {
    currentIndex: 4,
    totalQuestions: 10,
  },
};

export const RetryMode: Story = {
  args: {
    mode: "retry",
    currentIndex: 1,
    totalQuestions: 5,
  },
};
