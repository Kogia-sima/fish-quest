import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearScoreHistory,
  getHistoryStats,
  loadScoreHistory,
  saveScoreHistory,
} from "./historyLogic";
import type { ScoreHistoryEntry } from "./types";

// テスト用のヘルパー関数: エントリーを作成
function createEntry(
  percentage: number,
  score: number = 8,
  total: number = 10,
  timestamp: number = Date.now(),
): ScoreHistoryEntry {
  return {
    id: `test-${Math.random()}`,
    timestamp,
    score,
    total,
    percentage,
    mode: "normal",
  };
}

describe("getHistoryStats", () => {
  it("空のエントリーの場合はゼロの統計を返す", () => {
    const result = getHistoryStats([]);
    expect(result).toEqual({
      count: 0,
      averagePercentage: 0,
      bestScore: 0,
      recentTrend: 0,
    });
  });

  it("単一エントリーの統計を計算する", () => {
    const entries = [createEntry(80)];
    const result = getHistoryStats(entries);
    expect(result.count).toBe(1);
    expect(result.averagePercentage).toBe(80);
    expect(result.bestScore).toBe(80);
    expect(result.recentTrend).toBe(80); // 古いデータがないため、recentAvg - 0 = 80
  });

  it("複数エントリーの平均正解率を計算する", () => {
    const entries = [
      createEntry(80),
      createEntry(60),
      createEntry(100),
      createEntry(40),
    ];
    const result = getHistoryStats(entries);
    expect(result.count).toBe(4);
    // (80 + 60 + 100 + 40) / 4 = 70
    expect(result.averagePercentage).toBe(70);
  });

  it("最高スコアを正しく検出する", () => {
    const entries = [
      createEntry(80),
      createEntry(60),
      createEntry(100),
      createEntry(40),
      createEntry(90),
    ];
    const result = getHistoryStats(entries);
    expect(result.bestScore).toBe(100);
  });

  it("最近のトレンドを計算する（10件以上）", () => {
    // 最近5件（0-4）の平均: (90 + 85 + 88 + 92 + 87) / 5 = 88.4
    // 古い5件（5-9）の平均: (70 + 65 + 68 + 72 + 75) / 5 = 70
    // トレンド: 88.4 - 70 = 18.4
    const entries = [
      createEntry(90),
      createEntry(85),
      createEntry(88),
      createEntry(92),
      createEntry(87),
      createEntry(70),
      createEntry(65),
      createEntry(68),
      createEntry(72),
      createEntry(75),
      createEntry(60), // 10以降は無視される
    ];
    const result = getHistoryStats(entries);
    expect(result.recentTrend).toBeCloseTo(18.4, 1);
  });

  it("10件未満のエントリーでトレンドを計算する（7件）", () => {
    // 最近5件（0-4）の平均: (80 + 75 + 85 + 78 + 82) / 5 = 80
    // 古い2件（5-6）の平均: (70 + 65) / 2 = 67.5
    // トレンド: 80 - 67.5 = 12.5
    const entries = [
      createEntry(80),
      createEntry(75),
      createEntry(85),
      createEntry(78),
      createEntry(82),
      createEntry(70),
      createEntry(65),
    ];
    const result = getHistoryStats(entries);
    expect(result.recentTrend).toBeCloseTo(12.5, 1);
  });

  it("5件のエントリーでトレンドを計算する", () => {
    // 最近5件（0-4）の平均: (80 + 75 + 85 + 78 + 82) / 5 = 80
    // 古い件数なし → olderAvg = 0 / 1 = 0
    // トレンド: 80 - 0 = 80
    const entries = [
      createEntry(80),
      createEntry(75),
      createEntry(85),
      createEntry(78),
      createEntry(82),
    ];
    const result = getHistoryStats(entries);
    expect(result.recentTrend).toBe(80);
  });

  it("2件のエントリーでトレンドを計算する", () => {
    // 最近2件（0-1）の平均: (80 + 70) / 2 = 75
    // 古い件数なし → olderAvg = 0 / 1 = 0
    // トレンド: 75 - 0 = 75
    const entries = [createEntry(80), createEntry(70)];
    const result = getHistoryStats(entries);
    expect(result.recentTrend).toBe(75);
  });

  it("パーセンテージを正しく丸める", () => {
    // 平均: (81 + 82 + 83) / 3 = 82
    const entries = [createEntry(81), createEntry(82), createEntry(83)];
    const result = getHistoryStats(entries);
    expect(result.averagePercentage).toBe(82);
  });

  it("挑戦回数を正しくカウントする", () => {
    const entries = Array.from({ length: 15 }, (_, i) => createEntry(80 + i));
    const result = getHistoryStats(entries);
    expect(result.count).toBe(15);
  });

  it("下降トレンド（負の値）を計算する", () => {
    // 最近5件の平均: (50 + 55 + 52 + 48 + 53) / 5 = 51.6
    // 古い5件の平均: (80 + 85 + 82 + 88 + 90) / 5 = 85
    // トレンド: 51.6 - 85 = -33.4
    const entries = [
      createEntry(50), // recent
      createEntry(55),
      createEntry(52),
      createEntry(48),
      createEntry(53),
      createEntry(80), // older
      createEntry(85),
      createEntry(82),
      createEntry(88),
      createEntry(90),
    ];
    const result = getHistoryStats(entries);
    expect(result.recentTrend).toBeCloseTo(-33.4, 1);
  });

  it("すべて同じスコアの場合", () => {
    const entries = Array.from({ length: 10 }, () => createEntry(75));
    const result = getHistoryStats(entries);
    expect(result.count).toBe(10);
    expect(result.averagePercentage).toBe(75);
    expect(result.bestScore).toBe(75);
    expect(result.recentTrend).toBe(0); // 変化なし
  });
});

describe("saveScoreHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorageに新しいエントリーを保存する", () => {
    saveScoreHistory(8, 10, "normal");

    const saved = localStorage.getItem("fish-quiz-score-history");
    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed.version).toBe(1);
    expect(parsed.entries).toHaveLength(1);
    expect(parsed.entries[0].score).toBe(8);
    expect(parsed.entries[0].total).toBe(10);
    expect(parsed.entries[0].percentage).toBe(80);
    expect(parsed.entries[0].mode).toBe("normal");
  });

  it("既存エントリーの先頭に追加する", () => {
    saveScoreHistory(5, 10, "normal");
    saveScoreHistory(8, 10, "normal");

    const saved = localStorage.getItem("fish-quiz-score-history");
    const parsed = JSON.parse(saved!);
    expect(parsed.entries).toHaveLength(2);
    expect(parsed.entries[0].score).toBe(8); // 最新が先頭
    expect(parsed.entries[1].score).toBe(5); // 古いのが後
  });

  it("最大50件に制限する", () => {
    // 51件保存
    for (let i = 0; i < 51; i++) {
      saveScoreHistory(i, 10, "normal");
    }

    const saved = localStorage.getItem("fish-quiz-score-history");
    const parsed = JSON.parse(saved!);
    expect(parsed.entries).toHaveLength(50);
    expect(parsed.entries[0].score).toBe(50); // 最新
    expect(parsed.entries[49].score).toBe(1); // 50番目（0番目は削除される）
  });

  it("正解率を正しく計算する", () => {
    saveScoreHistory(7, 10, "normal");

    const saved = localStorage.getItem("fish-quiz-score-history");
    const parsed = JSON.parse(saved!);
    expect(parsed.entries[0].percentage).toBe(70);
  });

  it("ユニークIDを生成する", () => {
    saveScoreHistory(5, 10, "normal");
    saveScoreHistory(8, 10, "normal");

    const saved = localStorage.getItem("fish-quiz-score-history");
    const parsed = JSON.parse(saved!);
    expect(parsed.entries[0].id).not.toBe(parsed.entries[1].id);
    expect(typeof parsed.entries[0].id).toBe("string");
  });

  it("localStorageエラーを処理する", () => {
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    expect(() => saveScoreHistory(5, 10, "normal")).not.toThrow();

    localStorage.setItem = originalSetItem;
  });
});

describe("loadScoreHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("データが存在しない場合はデフォルト構造を返す", () => {
    const result = loadScoreHistory();
    expect(result).toEqual({ version: 1, entries: [] });
  });

  it("有効なデータを正しくパースする", () => {
    const data = {
      version: 1,
      entries: [createEntry(80), createEntry(60)],
    };
    localStorage.setItem("fish-quiz-score-history", JSON.stringify(data));

    const result = loadScoreHistory();
    expect(result.version).toBe(1);
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0].percentage).toBe(80);
  });

  it("不正なデータの場合は初期化する", () => {
    localStorage.setItem(
      "fish-quiz-score-history",
      JSON.stringify({ invalid: "data" }),
    );

    const result = loadScoreHistory();
    expect(result).toEqual({ version: 1, entries: [] });
  });

  it("JSONパースエラーを処理する", () => {
    localStorage.setItem("fish-quiz-score-history", "invalid json{");

    const result = loadScoreHistory();
    expect(result).toEqual({ version: 1, entries: [] });
  });
});

describe("clearScoreHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("localStorageからデータを削除する", () => {
    localStorage.setItem(
      "fish-quiz-score-history",
      JSON.stringify({ version: 1, entries: [] }),
    );
    expect(localStorage.getItem("fish-quiz-score-history")).not.toBeNull();

    clearScoreHistory();

    expect(localStorage.getItem("fish-quiz-score-history")).toBeNull();
  });

  it("エラーを処理する", () => {
    const originalRemoveItem = localStorage.removeItem;
    localStorage.removeItem = vi.fn().mockImplementation(() => {
      throw new Error("Storage error");
    });

    expect(() => clearScoreHistory()).not.toThrow();

    localStorage.removeItem = originalRemoveItem;
  });
});
