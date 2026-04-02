import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2Eテスト設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // テストディレクトリ
  testDir: "./test/e2e",

  // タイムアウト設定（JSONLロード考慮）
  timeout: 10000,

  // 並列実行
  fullyParallel: true,

  // レポーター
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],

  // 共通設定
  use: {
    // Next.js開発サーバーのURL
    baseURL: "http://localhost:3000",

    // スクリーンショット・トレース（失敗時のみ）
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },

  // プロジェクト設定（Chromiumのみ）
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // ローカルサーバー自動起動
  webServer: {
    command: "pnpm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2分（Next.js起動待ち）
  },
});
