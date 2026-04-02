/**
 * 魚データ読み込みモジュール
 * サーバーサイドでのJSONLファイル読み込みと、共通ユーティリティ関数の再エクスポートを提供する
 * @module fishData
 */
import fs from "node:fs";
import path from "node:path";
import type { FishData } from "./types";

/**
 * JSONLファイルから魚データを読み込む（サーバーサイド専用）
 * public/fish_images.jsonl を読み込み、各行をJSONとしてパースする
 * @returns 魚データの配列
 */
export async function loadFishData(): Promise<FishData[]> {
  const filePath = path.join(process.cwd(), "public", "fish_images.jsonl");
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const lines = fileContent.split("\n").filter((line) => line.trim());
  return lines.map((line) => JSON.parse(line));
}

// クライアント/サーバー共通の関数を fishUtils.ts から再エクスポート
// これにより、サーバーコンポーネントで一箇所からすべての関数をインポート可能
export {
  filterFishData,
  getAllCategories,
  getAllClassifications,
  getAllRarities,
  getClassificationsByCategories,
} from "./fishUtils";
