/**
 * 魚データの型定義
 */
export interface FishData {
  name: string;
  category: string;
  classification: string | null;
  image_url: string | null;
  detail_url: string | null;
  image_filename: string | null;
  rarity: number | null;
}

/**
 * フィルターオプションの型定義
 */
export interface FilterOptions {
  categories: string[];
  classifications: string[];
}

/**
 * クイズ問題の型定義
 */
export interface QuizQuestion {
  fish: FishData;
  userAnswer: string;
  isCorrect: boolean | null;
}

/**
 * 復習クイズのデータ型定義
 */
export interface RetryQuizData {
  mode: 'retry';
  questions: FishData[];
  originalSettings: {
    categories: string[];
    classifications: string[];
    rarities: number[];
  };
  previousScore: {
    score: number;
    total: number;
  };
  timestamp?: number;
}

/**
 * クイズモードの型定義
 */
export type QuizMode = 'normal' | 'retry';

/**
 * スコア履歴のエントリー
 */
export interface ScoreHistoryEntry {
  id: string;
  timestamp: number;
  score: number;
  total: number;
  percentage: number;
  mode: QuizMode;
}

/**
 * スコア履歴の全体データ
 */
export interface ScoreHistory {
  entries: ScoreHistoryEntry[];
  version: number;
}
