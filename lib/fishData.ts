import fs from 'fs';
import path from 'path';
import { FishData } from './types';

/**
 * JSONLファイルから魚データを読み込む（サーバーサイド専用）
 * @returns 魚データの配列
 */
export async function loadFishData(): Promise<FishData[]> {
  const filePath = path.join(process.cwd(), 'public', 'fish_images.jsonl');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  return lines.map(line => JSON.parse(line));
}

// クライアント/サーバー共通の関数は fishUtils.ts から再エクスポート
export {
  getAllCategories,
  getAllClassifications,
  getAllRarities,
  getClassificationsByCategories,
  filterFishData,
} from './fishUtils';
