import { describe, expect, it } from "vitest";
import {
  filterFishData,
  getAllCategories,
  getAllClassifications,
  getAllRarities,
  getClassificationsByCategories,
} from "./fishUtils";
import type { FishData } from "./types";

// テスト用のモックデータ
const mockFishData: FishData[] = [
  {
    name: "マグロ",
    category: "マグロの仲間",
    classification: "サバ科",
    image_url: null,
    detail_url: null,
    image_filename: "maguro.jpg",
    rarity: 3,
  },
  {
    name: "カツオ",
    category: "マグロの仲間",
    classification: "サバ科",
    image_url: null,
    detail_url: null,
    image_filename: "katsuo.jpg",
    rarity: 2,
  },
  {
    name: "フグ",
    category: "フグの仲間",
    classification: null,
    image_url: null,
    detail_url: null,
    image_filename: "fugu.jpg",
    rarity: null,
  },
  {
    name: "トラフグ",
    category: "フグの仲間",
    classification: "フグ科",
    image_url: null,
    detail_url: null,
    image_filename: "torafugu.jpg",
    rarity: 5,
  },
  {
    name: "タイ",
    category: "タイの仲間",
    classification: "タイ科",
    image_url: null,
    detail_url: null,
    image_filename: "tai.jpg",
    rarity: 1,
  },
];

describe("getAllCategories", () => {
  it("空の配列の場合は空の配列を返す", () => {
    expect(getAllCategories([])).toEqual([]);
  });

  it("単一の魚から単一のカテゴリーを返す", () => {
    const singleFish = [mockFishData[0]];
    expect(getAllCategories(singleFish)).toEqual(["マグロの仲間"]);
  });

  it("重複を除いてソート済みのカテゴリーを返す", () => {
    const result = getAllCategories(mockFishData);
    expect(result).toEqual(["タイの仲間", "フグの仲間", "マグロの仲間"]);
  });

  it("カテゴリーがアルファベット順にソートされる", () => {
    const result = getAllCategories(mockFishData);
    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });
});

describe("getAllClassifications", () => {
  it("nullを除外して分類を返す", () => {
    const result = getAllClassifications(mockFishData);
    expect(result).toContain("サバ科");
    expect(result).toContain("フグ科");
    expect(result).toContain("タイ科");
    expect(result).not.toContain(null);
  });

  it("全てnullの場合は空配列を返す", () => {
    const nullFish = [mockFishData[2]]; // フグ（classificationがnull）
    expect(getAllClassifications(nullFish)).toEqual([]);
  });

  it("重複を除いてソート済みの分類を返す", () => {
    const result = getAllClassifications(mockFishData);
    expect(result).toEqual(["サバ科", "タイ科", "フグ科"]);
  });

  it("分類がアルファベット順にソートされる", () => {
    const result = getAllClassifications(mockFishData);
    const sorted = [...result].sort();
    expect(result).toEqual(sorted);
  });
});

describe("getAllRarities", () => {
  it("nullを除外してレア度を返す", () => {
    const result = getAllRarities(mockFishData);
    expect(result).toContain(1);
    expect(result).toContain(2);
    expect(result).toContain(3);
    expect(result).toContain(5);
    expect(result).not.toContain(null);
  });

  it("昇順ソートされたレア度を返す", () => {
    const result = getAllRarities(mockFishData);
    expect(result).toEqual([1, 2, 3, 5]);
  });

  it("全てnullの場合は空配列を返す", () => {
    const nullRarityFish = [mockFishData[2]]; // フグ（rarityがnull）
    expect(getAllRarities(nullRarityFish)).toEqual([]);
  });

  it("重複するレア度を1つにまとめる", () => {
    const duplicateRarities: FishData[] = [
      { ...mockFishData[0], rarity: 2 },
      { ...mockFishData[1], rarity: 2 },
      { ...mockFishData[4], rarity: 3 },
    ];
    const result = getAllRarities(duplicateRarities);
    expect(result).toEqual([2, 3]);
  });
});

describe("getClassificationsByCategories", () => {
  it("空のカテゴリー配列の場合は全分類を返す", () => {
    const result = getClassificationsByCategories(mockFishData, []);
    expect(result).toEqual(["サバ科", "タイ科", "フグ科"]);
  });

  it("単一カテゴリーでフィルタリングする", () => {
    const result = getClassificationsByCategories(mockFishData, [
      "マグロの仲間",
    ]);
    expect(result).toEqual(["サバ科"]);
  });

  it("複数カテゴリーでフィルタリングする", () => {
    const result = getClassificationsByCategories(mockFishData, [
      "マグロの仲間",
      "フグの仲間",
    ]);
    expect(result).toEqual(["サバ科", "フグ科"]);
  });

  it("該当なしの場合は空配列を返す", () => {
    const result = getClassificationsByCategories(mockFishData, [
      "存在しないカテゴリー",
    ]);
    expect(result).toEqual([]);
  });

  it("nullの分類は除外される", () => {
    const result = getClassificationsByCategories(mockFishData, ["フグの仲間"]);
    expect(result).toContain("フグ科");
    expect(result).not.toContain(null);
  });
});

describe("filterFishData", () => {
  it("全てのフィルターが空の場合は全データを返す", () => {
    const result = filterFishData(mockFishData, [], [], []);
    expect(result).toEqual(mockFishData);
  });

  it("カテゴリーのみでフィルタリングする", () => {
    const result = filterFishData(mockFishData, ["マグロの仲間"], [], []);
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.category === "マグロの仲間")).toBe(true);
  });

  it("分類のみでフィルタリングする", () => {
    const result = filterFishData(mockFishData, [], ["サバ科"], []);
    expect(result).toHaveLength(2);
    expect(result.every((f) => f.classification === "サバ科")).toBe(true);
  });

  it("レア度のみでフィルタリングする", () => {
    const result = filterFishData(mockFishData, [], [], [3]);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("マグロ");
  });

  it("複合フィルタリング（カテゴリー + 分類）", () => {
    const result = filterFishData(
      mockFishData,
      ["マグロの仲間"],
      ["サバ科"],
      [],
    );
    expect(result).toHaveLength(2);
    expect(
      result.every(
        (f) => f.category === "マグロの仲間" && f.classification === "サバ科",
      ),
    ).toBe(true);
  });

  it("複合フィルタリング（カテゴリー + 分類 + レア度）", () => {
    const result = filterFishData(
      mockFishData,
      ["マグロの仲間"],
      ["サバ科"],
      [3],
    );
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("マグロ");
  });

  it("該当なしの場合は空配列を返す", () => {
    const result = filterFishData(
      mockFishData,
      ["存在しないカテゴリー"],
      [],
      [],
    );
    expect(result).toEqual([]);
  });

  it("分類がnullの魚は分類フィルターで除外される", () => {
    const result = filterFishData(mockFishData, [], ["フグ科"], []);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("トラフグ");
    expect(result.every((f) => f.name !== "フグ")).toBe(true);
  });

  it("レア度がnullの魚はレア度フィルターで除外される", () => {
    const result = filterFishData(mockFishData, [], [], [1, 2, 3, 5]);
    expect(result).toHaveLength(4);
    expect(result.every((f) => f.name !== "フグ")).toBe(true);
  });

  it("複数カテゴリーでフィルタリングする", () => {
    const result = filterFishData(
      mockFishData,
      ["マグロの仲間", "タイの仲間"],
      [],
      [],
    );
    expect(result).toHaveLength(3);
    expect(result.some((f) => f.category === "マグロの仲間")).toBe(true);
    expect(result.some((f) => f.category === "タイの仲間")).toBe(true);
  });

  it("複数レア度でフィルタリングする", () => {
    const result = filterFishData(mockFishData, [], [], [1, 5]);
    expect(result).toHaveLength(2);
    expect(result.some((f) => f.rarity === 1)).toBe(true);
    expect(result.some((f) => f.rarity === 5)).toBe(true);
  });
});
