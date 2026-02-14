import { FishData } from './types';

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
