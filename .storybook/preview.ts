import { definePreview } from "@storybook/nextjs";
import "../src/app/globals.css";

export default definePreview({
  parameters: {
    nextjs: {
      appDirectory: true,
    },
  },
});
