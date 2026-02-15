/**
 * クイズロジックモジュール
 * 問題選択、回答判定、復習データ管理などクイズの中核機能を提供する
 * SessionStorageを使用して間違えた問題の復習機能をサポートする
 * @module quizLogic
 */
import { FishData, RetryQuizData } from './types';

/**
 * Fisher-Yatesアルゴリズムで配列をランダムに最大N個選択
 * @param fishData 魚データの配列
 * @param maxCount 最大選択数（デフォルト: 10）
 * @returns ランダムに選択された魚データの配列
 */
export function selectRandomFish(fishData: FishData[], maxCount: number = 10): FishData[] {
  const shuffled = [...fishData].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(maxCount, fishData.length));
}

/**
 * 回答の正誤判定（完全一致、trim処理あり）
 * @param correctName 正解の魚の名前
 * @param userAnswer ユーザーの回答
 * @returns 正解ならtrue、不正解ならfalse
 */
export function checkAnswer(correctName: string, userAnswer: string): boolean {
  return correctName.trim() === userAnswer.trim();
}

/**
 * スコアに応じたメッセージを取得
 * @param score 正解数
 * @param total 総問題数
 * @returns メッセージ文字列
 */
export function getScoreMessage(score: number, total: number): string {
  const percentage = (score / total) * 100;
  if (percentage === 100) return '完璧です！';
  if (percentage >= 80) return '素晴らしい！';
  if (percentage >= 60) return 'よくできました！';
  if (percentage >= 40) return 'もう少し頑張りましょう';
  return 'もっと勉強が必要です';
}

// SessionStorageのキー（復習データの保存先）
const STORAGE_KEY = 'quiz-retry-data';

/**
 * 間違えた問題をsessionStorageに保存
 * @param wrongQuestions 間違えた問題の配列
 * @param settings フィルター設定
 * @param score 正解数
 * @param total 総問題数
 */
export function saveRetryData(
  wrongQuestions: FishData[],
  settings: { categories: string[]; classifications: string[]; rarities: number[] },
  score: number,
  total: number
): void {
  const retryData: RetryQuizData = {
    mode: 'retry',
    questions: wrongQuestions,
    originalSettings: settings,
    previousScore: { score, total },
    timestamp: Date.now()
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(retryData));
  } catch (error) {
    console.error('Failed to save retry data:', error);
  }
}

/**
 * sessionStorageから復習データを読み込み
 * @returns 復習データ、または存在しない場合はnull
 */
export function loadRetryData(): RetryQuizData | null {
  try {
    const data = sessionStorage.getItem(STORAGE_KEY);
    if (!data) return null;

    const parsed = JSON.parse(data);

    // データ検証
    if (!parsed.mode || !Array.isArray(parsed.questions)) {
      console.error('Invalid retry data structure');
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed as RetryQuizData;
  } catch (error) {
    console.error('Failed to load retry data:', error);
    sessionStorage.removeItem(STORAGE_KEY); // 破損データを削除
    return null;
  }
}

/**
 * sessionStorageから復習データを削除
 */
export function clearRetryData(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear retry data:', error);
  }
}
