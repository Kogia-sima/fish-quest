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
