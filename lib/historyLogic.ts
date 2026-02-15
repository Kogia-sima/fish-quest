/**
 * スコア履歴管理モジュール
 * LocalStorageを使用してクイズの正解率履歴を永続化・管理する
 * 最大50件までの履歴を保持し、統計情報の計算機能を提供する
 * @module historyLogic
 */
import { ScoreHistory, ScoreHistoryEntry, QuizMode } from './types';

// LocalStorageのキー
const STORAGE_KEY = 'fish-quiz-score-history';
// 保持する履歴の最大件数（これを超えると古いものから削除される）
const MAX_ENTRIES = 50;
// データ構造のバージョン（将来の互換性のため）
const CURRENT_VERSION = 1;

/**
 * ユニークIDを生成する
 * タイムスタンプとランダム文字列を組み合わせてユニークなIDを作成する
 * @returns ユニークID文字列（例: "1234567890-abc123def"）
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
  // 直近5件の平均と、その前の5件（6-10番目）の平均を比較してトレンドを算出
  const recent = entries.slice(0, Math.min(5, count));
  const recentAvg = recent.reduce((sum, e) => sum + e.percentage, 0) / recent.length;
  const older = entries.slice(5, Math.min(10, count));
  const olderAvg = older.reduce((sum, e) => sum + e.percentage, 0) / Math.max(1, older.length);
  // 正の値: 最近のスコアが向上、負の値: 最近のスコアが低下
  const recentTrend = recentAvg - olderAvg;

  return {
    count,
    averagePercentage,
    bestScore,
    recentTrend
  };
}
