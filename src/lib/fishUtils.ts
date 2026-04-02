import type { FishData } from "./types";

/**
 * すべてのカテゴリーを取得
 * @param fishData 魚データの配列
 * @returns カテゴリーの配列（ソート済み）
 */
export function getAllCategories(fishData: FishData[]): string[] {
  const categories = new Set(fishData.map((fish) => fish.category));
  return Array.from(categories).sort();
}

/**
 * すべての分類を取得（nullを除外）
 * @param fishData 魚データの配列
 * @returns 分類の配列（ソート済み）
 */
export function getAllClassifications(fishData: FishData[]): string[] {
  const classifications = new Set(
    fishData
      .map((fish) => fish.classification)
      .filter((c): c is string => c !== null),
  );
  return Array.from(classifications).sort();
}

/**
 * すべてのレア度を取得（nullを除外）
 * @param fishData 魚データの配列
 * @returns レア度の配列（昇順ソート済み）
 */
export function getAllRarities(fishData: FishData[]): number[] {
  const rarities = new Set(
    fishData.map((fish) => fish.rarity).filter((r): r is number => r !== null),
  );
  return Array.from(rarities).sort((a, b) => a - b);
}

/**
 * 選択されたカテゴリーに属する分類を取得
 * @param fishData 魚データの配列
 * @param selectedCategories 選択されたカテゴリーの配列
 * @returns 分類の配列（ソート済み）
 */
export function getClassificationsByCategories(
  fishData: FishData[],
  selectedCategories: string[],
): string[] {
  if (selectedCategories.length === 0) {
    return getAllClassifications(fishData);
  }

  const classifications = new Set(
    fishData
      .filter((fish) => selectedCategories.includes(fish.category))
      .map((fish) => fish.classification)
      .filter((c): c is string => c !== null),
  );
  return Array.from(classifications).sort();
}

/**
 * カテゴリー、分類、レア度でフィルタリング
 * @param fishData 魚データの配列
 * @param categories 選択されたカテゴリーの配列（空の場合はすべて）
 * @param classifications 選択された分類の配列（空の場合はすべて）
 * @param rarities 選択されたレア度の配列（空の場合はすべて）
 * @returns フィルタリングされた魚データの配列
 */
export function filterFishData(
  fishData: FishData[],
  categories: string[],
  classifications: string[],
  rarities: number[] = [],
): FishData[] {
  return fishData.filter((fish) => {
    const categoryMatch =
      categories.length === 0 || categories.includes(fish.category);
    const classificationMatch =
      classifications.length === 0 ||
      (fish.classification && classifications.includes(fish.classification));
    const rarityMatch =
      rarities.length === 0 ||
      (fish.rarity !== null && rarities.includes(fish.rarity));
    return categoryMatch && classificationMatch && rarityMatch;
  });
}
