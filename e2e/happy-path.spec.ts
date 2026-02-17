import { expect, test } from "@playwright/test";

/**
 * Happy Path E2Eテスト
 * ホーム → クイズ → クイズ画面の表示確認まで
 */
test.describe("Quiz Happy Path", () => {
  test("should navigate from home to quiz", async ({ page }) => {
    // 1. ホーム画面表示
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("魚の名前当てクイズ");

    // 2. クイズスタートボタンをクリック
    await page.getByRole("button", { name: /クイズを始める/i }).click();

    // 3. クイズ画面に遷移
    await page.waitForURL("/quiz");

    // 4. ローディング完了を待つ（"問題を準備中..."が消える）
    await expect(page.locator("text=問題を準備中")).not.toBeVisible({
      timeout: 8000,
    });

    // 5. 問題が表示される（問題番号「1 / X」形式）
    await expect(page.locator("text=/\\d+\\s*\\/\\s*\\d+/")).toBeVisible();

    // 6. 回答入力欄が表示される
    const answerInput = page.getByPlaceholder(/魚の名前を入力/i);
    await expect(answerInput).toBeVisible();

    // 7. 回答ボタンが表示される
    await expect(page.getByRole("button", { name: /回答/i })).toBeVisible();
  });
});
