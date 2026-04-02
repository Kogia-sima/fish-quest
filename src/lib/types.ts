/**
 * 型定義モジュール
 * アプリケーション全体で使用される共通型定義を集約する
 * @module types
 */

/**
 * 魚データの型定義
 */
export interface FishData {
  /** 魚の名前 */
  name: string;
  /** カテゴリー（例: カレイの仲間、フグの仲間、その他） */
  category: string;
  /** 分類（例: カレイ科、ヒラメ科）。nullの場合は分類なし */
  classification: string | null;
  /** 元の画像URL */
  image_url: string | null;
  /** 詳細ページのURL */
  detail_url: string | null;
  /** ローカルの画像ファイル名 */
  image_filename: string | null;
  /** レア度（1-5の範囲、数字が大きいほどレア）。nullの場合はレア度設定なし */
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
 * SessionStorageに保存され、間違えた問題のみを復習する機能を提供する
 */
export interface RetryQuizData {
  /** クイズモード（常に 'retry'） */
  mode: "retry";
  /** 間違えた問題の配列 */
  questions: FishData[];
  /** 元のクイズのフィルター設定 */
  originalSettings: {
    categories: string[];
    classifications: string[];
    rarities: number[];
  };
  /** 元のクイズのスコア */
  previousScore: {
    score: number;
    total: number;
  };
  /** データ保存時のタイムスタンプ（オプション、セッション管理用） */
  timestamp?: number;
}

/**
 * クイズモードの型定義
 */
export type QuizMode = "normal" | "retry";

/**
 * スコア履歴のエントリー
 * 各クイズ結果の記録を表す
 */
export interface ScoreHistoryEntry {
  /** ユニークID */
  id: string;
  /** 記録時のタイムスタンプ */
  timestamp: number;
  /** 正解数 */
  score: number;
  /** 総問題数 */
  total: number;
  /** 正解率（パーセンテージ、0-100） */
  percentage: number;
  /** クイズモード */
  mode: QuizMode;
}

/**
 * スコア履歴の全体データ
 * LocalStorageに保存される形式
 */
export interface ScoreHistory {
  /** 履歴エントリーの配列（新しい順） */
  entries: ScoreHistoryEntry[];
  /** データ構造のバージョン（将来の互換性のため） */
  version: number;
}
