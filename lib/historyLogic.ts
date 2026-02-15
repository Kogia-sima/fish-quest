import { ScoreHistory, ScoreHistoryEntry, QuizMode } from './types';

const STORAGE_KEY = 'fish-quiz-score-history';
const MAX_ENTRIES = 50;
const CURRENT_VERSION = 1;

/**
 * ユニークIDを生成
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * スコア履歴を保存
 * @param score 正解数
 * @param total 総問題数
 * @param mode クイズモード
 */
export function saveScoreHistory(score: number, total: number, mode: QuizMode): void {
  try {
    const history = loadScoreHistory();
    const percentage = Math.round((score / total) * 100);

    const newEntry: ScoreHistoryEntry = {
      id: generateId(),
      timestamp: Date.now(),
      score,
      total,
      percentage,
      mode
    };

    // 新しいエントリを先頭に追加
    history.entries.unshift(newEntry);

    // 最大件数を超えたら古いものを削除
    if (history.entries.length > MAX_ENTRIES) {
      history.entries = history.entries.slice(0, MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save score history:', error);
  }
}

/**
 * スコア履歴を読み込み
 * @returns スコア履歴データ
 */
export function loadScoreHistory(): ScoreHistory {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return { version: CURRENT_VERSION, entries: [] };
    }

    const parsed = JSON.parse(data) as ScoreHistory;

    // データ検証
    if (!parsed.version || !Array.isArray(parsed.entries)) {
      console.warn('Invalid history data structure, resetting');
      return { version: CURRENT_VERSION, entries: [] };
    }

    return parsed;
  } catch (error) {
    console.error('Failed to load score history:', error);
    return { version: CURRENT_VERSION, entries: [] };
  }
}

/**
 * スコア履歴を削除
 */
export function clearScoreHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear score history:', error);
  }
}

/**
 * スコア履歴の統計情報を取得
 * @param entries スコア履歴のエントリー配列
 * @returns 統計情報
 */
export function getHistoryStats(entries: ScoreHistoryEntry[]) {
  if (entries.length === 0) {
    return {
      count: 0,
      averagePercentage: 0,
      bestScore: 0,
      recentTrend: 0
    };
  }

  const count = entries.length;
  const averagePercentage = Math.round(
    entries.reduce((sum, e) => sum + e.percentage, 0) / count
  );
  const bestScore = Math.max(...entries.map(e => e.percentage));

  // 最近5件のトレンド（上昇傾向なら正、下降傾向なら負）
  const recent = entries.slice(0, Math.min(5, count));
  const recentAvg = recent.reduce((sum, e) => sum + e.percentage, 0) / recent.length;
  const olderAvg = entries.slice(5, Math.min(10, count)).reduce((sum, e) => sum + e.percentage, 0) / Math.max(1, entries.slice(5, 10).length);
  const recentTrend = recentAvg - olderAvg;

  return {
    count,
    averagePercentage,
    bestScore,
    recentTrend
  };
}
