import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  checkAnswer,
  clearRetryData,
  getScoreMessage,
  loadRetryData,
  saveRetryData,
  selectRandomFish,
} from "./quizLogic";
import type { FishData } from "./types";

// テスト用のモックデータ
const mockFishData: FishData[] = [
  {
    name: "マグロ",
    category: "マグロの仲間",
    classification: "サバ科",
    image_url: null,
    detail_url: null,
    image_filename: "maguro.jpg",
    rarity: 3,
  },
  {
    name: "カツオ",
    category: "マグロの仲間",
    classification: "サバ科",
    image_url: null,
    detail_url: null,
    image_filename: "katsuo.jpg",
    rarity: 2,
  },
  {
    name: "フグ",
    category: "フグの仲間",
    classification: null,
    image_url: null,
    detail_url: null,
    image_filename: "fugu.jpg",
    rarity: null,
  },
  {
    name: "タイ",
    category: "タイの仲間",
    classification: "タイ科",
    image_url: null,
    detail_url: null,
    image_filename: "tai.jpg",
    rarity: 1,
  },
  {
    name: "サバ",
    category: "マグロの仲間",
    classification: "サバ科",
    image_url: null,
    detail_url: null,
    image_filename: "saba.jpg",
    rarity: 1,
  },
];

describe("selectRandomFish", () => {
  beforeEach(() => {
    // Math.random()をモックして決定的な動作にする
    let callCount = 0;
    vi.spyOn(Math, "random").mockImplementation(() => {
      // -0.5から+0.5の範囲の値を返すパターン
      const values = [0.1, 0.9, 0.3, 0.7, 0.5, 0.2, 0.8, 0.4, 0.6, 0.15];
      return values[callCount++ % values.length];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("指定数の魚をランダムに選択する", () => {
    const result = selectRandomFish(mockFishData, 3);
    expect(result).toHaveLength(3);
    expect(result.every((fish) => mockFishData.includes(fish))).toBe(true);
  });

  it("maxCountがデータ数を超える場合は全データを返す", () => {
    const result = selectRandomFish(mockFishData, 100);
    expect(result).toHaveLength(mockFishData.length);
  });

  it("空の配列の場合は空の配列を返す", () => {
    const result = selectRandomFish([]);
    expect(result).toEqual([]);
  });

  it("元のデータを変更しない（イミュータブル）", () => {
    const original = [...mockFishData];
    selectRandomFish(mockFishData, 3);
    expect(mockFishData).toEqual(original);
  });

  it("デフォルトで最大10個を選択する", () => {
    const largeData = Array.from({ length: 20 }, (_, i) => ({
      ...mockFishData[0],
      name: `魚${i}`,
      image_filename: `fish${i}.jpg`,
    }));
    const result = selectRandomFish(largeData);
    expect(result).toHaveLength(10);
  });

  it("maxCountが0の場合は空の配列を返す", () => {
    const result = selectRandomFish(mockFishData, 0);
    expect(result).toEqual([]);
  });

  it("maxCountが負の場合は空の配列を返す", () => {
    const result = selectRandomFish(mockFishData, -5);
    expect(result).toEqual([]);
  });
});

describe("checkAnswer", () => {
  it("完全一致の場合はtrueを返す", () => {
    expect(checkAnswer("マグロ", "マグロ")).toBe(true);
    expect(checkAnswer("カツオ", "カツオ")).toBe(true);
  });

  it("大文字小文字を区別する", () => {
    // 日本語では大文字小文字の概念が異なるが、完全一致を要求
    expect(checkAnswer("マグロ", "まぐろ")).toBe(false);
    expect(checkAnswer("ABC", "abc")).toBe(false);
  });

  it("前後の空白をトリムして判定する", () => {
    expect(checkAnswer("マグロ", "  マグロ  ")).toBe(true);
    expect(checkAnswer("  マグロ  ", "マグロ")).toBe(true);
    expect(checkAnswer("  マグロ  ", "  マグロ  ")).toBe(true);
  });

  it("空文字列は不正解", () => {
    expect(checkAnswer("マグロ", "")).toBe(false);
    expect(checkAnswer("", "マグロ")).toBe(false);
  });

  it("空白のみの文字列はtrim後に空文字列になるので不正解", () => {
    expect(checkAnswer("マグロ", "   ")).toBe(false);
    expect(checkAnswer("   ", "マグロ")).toBe(false);
  });

  it("不一致の場合はfalseを返す", () => {
    expect(checkAnswer("マグロ", "カツオ")).toBe(false);
    expect(checkAnswer("フグ", "タイ")).toBe(false);
  });

  it("空文字列同士の比較はtrueを返す", () => {
    expect(checkAnswer("", "")).toBe(true);
    expect(checkAnswer("   ", "  ")).toBe(true);
  });

  it("部分一致は不正解", () => {
    expect(checkAnswer("マグロ", "マグ")).toBe(false);
    expect(checkAnswer("マグロ", "グロ")).toBe(false);
    expect(checkAnswer("マグロ", "マグロです")).toBe(false);
  });
});

describe("getScoreMessage", () => {
  it("100%の場合は「完璧です！」を返す", () => {
    expect(getScoreMessage(10, 10)).toBe("完璧です！");
    expect(getScoreMessage(5, 5)).toBe("完璧です！");
  });

  it("80-99%の場合は「素晴らしい！」を返す", () => {
    expect(getScoreMessage(9, 10)).toBe("素晴らしい！");
    expect(getScoreMessage(8, 10)).toBe("素晴らしい！");
    expect(getScoreMessage(4, 5)).toBe("素晴らしい！");
  });

  it("60-79%の場合は「よくできました！」を返す", () => {
    expect(getScoreMessage(7, 10)).toBe("よくできました！");
    expect(getScoreMessage(6, 10)).toBe("よくできました！");
    expect(getScoreMessage(3, 5)).toBe("よくできました！");
  });

  it("40-59%の場合は「もう少し頑張りましょう」を返す", () => {
    expect(getScoreMessage(5, 10)).toBe("もう少し頑張りましょう");
    expect(getScoreMessage(4, 10)).toBe("もう少し頑張りましょう");
    expect(getScoreMessage(2, 5)).toBe("もう少し頑張りましょう");
  });

  it("0-39%の場合は「もっと勉強が必要です」を返す", () => {
    expect(getScoreMessage(3, 10)).toBe("もっと勉強が必要です");
    expect(getScoreMessage(2, 10)).toBe("もっと勉強が必要です");
    expect(getScoreMessage(1, 10)).toBe("もっと勉強が必要です");
    expect(getScoreMessage(0, 10)).toBe("もっと勉強が必要です");
  });

  it("境界値（80%、60%、40%）を正しく処理する", () => {
    // 80% ちょうど → 素晴らしい！
    expect(getScoreMessage(8, 10)).toBe("素晴らしい！");
    // 60% ちょうど → よくできました！
    expect(getScoreMessage(6, 10)).toBe("よくできました！");
    // 40% ちょうど → もう少し頑張りましょう
    expect(getScoreMessage(4, 10)).toBe("もう少し頑張りましょう");
  });

  it("0/10の場合は最低メッセージを返す", () => {
    expect(getScoreMessage(0, 10)).toBe("もっと勉強が必要です");
  });

  it("10/10の場合は最高メッセージを返す", () => {
    expect(getScoreMessage(10, 10)).toBe("完璧です！");
  });

  it("小数点以下の正解率を正しく処理する", () => {
    // 7/9 = 77.77...% → よくできました！
    expect(getScoreMessage(7, 9)).toBe("よくできました！");
    // 5/7 = 71.42...% → よくできました！
    expect(getScoreMessage(5, 7)).toBe("よくできました！");
    // 3/7 = 42.85...% → もう少し頑張りましょう
    expect(getScoreMessage(3, 7)).toBe("もう少し頑張りましょう");
  });
});

describe("saveRetryData", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sessionStorageに正しくデータを保存する", () => {
    const wrongQuestions = [mockFishData[0], mockFishData[1]];
    const settings = {
      categories: ["マグロの仲間"],
      classifications: ["サバ科"],
      rarities: [3],
    };

    saveRetryData(wrongQuestions, settings, 3, 5);

    const saved = sessionStorage.getItem("quiz-retry-data");
    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed.mode).toBe("retry");
    expect(parsed.questions).toHaveLength(2);
    expect(parsed.questions[0].name).toBe("マグロ");
    expect(parsed.previousScore).toEqual({ score: 3, total: 5 });
  });

  it("RetryQuizData構造が正しい", () => {
    const wrongQuestions = [mockFishData[2]];
    const settings = {
      categories: ["フグの仲間"],
      classifications: [],
      rarities: [],
    };

    saveRetryData(wrongQuestions, settings, 0, 1);

    const saved = sessionStorage.getItem("quiz-retry-data");
    const parsed = JSON.parse(saved!);

    expect(parsed).toHaveProperty("mode");
    expect(parsed).toHaveProperty("questions");
    expect(parsed).toHaveProperty("originalSettings");
    expect(parsed).toHaveProperty("previousScore");
    expect(parsed).toHaveProperty("timestamp");
    expect(typeof parsed.timestamp).toBe("number");
  });

  it("sessionStorage.setItem()エラーを処理する", () => {
    // sessionStorageを無効化してエラーをシミュレート
    const originalSetItem = sessionStorage.setItem;
    sessionStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    // エラーが発生してもクラッシュしない
    expect(() => {
      saveRetryData(
        [mockFishData[0]],
        { categories: [], classifications: [], rarities: [] },
        0,
        1,
      );
    }).not.toThrow();

    // 復元
    sessionStorage.setItem = originalSetItem;
  });
});

describe("loadRetryData", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("データが存在しない場合はnullを返す", () => {
    const result = loadRetryData();
    expect(result).toBeNull();
  });

  it("有効なJSONデータを正しくパースする", () => {
    const data = {
      mode: "retry",
      questions: [mockFishData[0]],
      originalSettings: { categories: [], classifications: [], rarities: [] },
      previousScore: { score: 5, total: 10 },
      timestamp: Date.now(),
    };

    sessionStorage.setItem("quiz-retry-data", JSON.stringify(data));

    const result = loadRetryData();
    expect(result).not.toBeNull();
    expect(result?.mode).toBe("retry");
    expect(result?.questions).toHaveLength(1);
    expect(result?.previousScore).toEqual({ score: 5, total: 10 });
  });

  it("無効なJSONの場合はnullを返す", () => {
    sessionStorage.setItem("quiz-retry-data", "invalid json{");

    const result = loadRetryData();
    expect(result).toBeNull();
  });

  it("不正な構造の場合はnullを返してクリアする", () => {
    // modeが欠けている
    sessionStorage.setItem(
      "quiz-retry-data",
      JSON.stringify({ questions: [] }),
    );

    const result = loadRetryData();
    expect(result).toBeNull();
    expect(sessionStorage.getItem("quiz-retry-data")).toBeNull();
  });

  it("questionsがない場合もnullを返す", () => {
    sessionStorage.setItem(
      "quiz-retry-data",
      JSON.stringify({ mode: "retry" }),
    );

    const result = loadRetryData();
    expect(result).toBeNull();
  });
});

describe("clearRetryData", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("sessionStorageからデータを削除する", () => {
    sessionStorage.setItem(
      "quiz-retry-data",
      JSON.stringify({ mode: "retry", questions: [] }),
    );
    expect(sessionStorage.getItem("quiz-retry-data")).not.toBeNull();

    clearRetryData();

    expect(sessionStorage.getItem("quiz-retry-data")).toBeNull();
  });

  it("エラーを処理する", () => {
    const originalRemoveItem = sessionStorage.removeItem;
    sessionStorage.removeItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });

    expect(() => clearRetryData()).not.toThrow();

    sessionStorage.removeItem = originalRemoveItem;
  });
});
