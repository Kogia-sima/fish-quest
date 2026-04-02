/**
 * クイズページ
 *
 * 主な機能:
 * - 通常モードと復習モードの両方に対応
 * - URL Paramsからフィルター条件を取得
 * - JSONLファイルからクライアントサイドで魚データを読み込み
 * - 回答状態の管理とスコア計算
 * - 間違えた問題の記録と復習機能
 *
 * @module app/quiz/page
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import QuizCard from "@/components/QuizCard";
import {
  checkAnswer,
  clearRetryData,
  loadRetryData,
  saveRetryData,
  selectRandomFish,
} from "@/lib/quizLogic";
import type { FishData, QuizMode } from "@/lib/types";

/**
 * クイズページのメインコンテンツコンポーネント
 */
function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 状態管理
  const [_fishData, setFishData] = useState<FishData[]>([]); // フィルタリング済みの魚データ全体
  const [questions, setQuestions] = useState<FishData[]>([]); // 今回のクイズ出題データ（最大10問）
  const [currentIndex, setCurrentIndex] = useState(0); // 現在の問題番号（0始まり）
  const [userAnswer, setUserAnswer] = useState(""); // ユーザーの入力値
  const [isAnswered, setIsAnswered] = useState(false); // 回答済みフラグ
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null); // 正誤判定結果
  const [correctCount, setCorrectCount] = useState(0); // 累積正解数
  const [isLoading, setIsLoading] = useState(true); // データ読み込み状態
  const [wrongQuestions, setWrongQuestions] = useState<FishData[]>([]); // 間違えた問題のリスト
  const [quizMode, setQuizMode] = useState<QuizMode>("normal"); // 'normal' | 'retry'
  const [filterSettings, setFilterSettings] = useState({
    categories: [] as string[],
    classifications: [] as string[],
    rarities: [] as number[],
  }); // フィルター設定（復習時に使用）

  // データの読み込みとフィルタリング
  // 1. 復習モード（mode=retry）の場合: sessionStorageからデータ取得
  // 2. 通常モードの場合: JSONLファイル読み込み → URL Paramsでフィルタリング → ランダム選択
  useEffect(() => {
    const loadData = async () => {
      // 復習モードのチェック
      const mode = searchParams.get("mode");
      if (mode === "retry") {
        const retryData = loadRetryData();
        if (retryData) {
          setQuizMode("retry");
          setQuestions(retryData.questions);
          setFilterSettings(retryData.originalSettings);
          setIsLoading(false);
          return;
        }
      }

      // 通常モードの処理
      try {
        // クライアントサイドでJSONLを読み込む（public/fish_images.jsonl）
        const response = await fetch("/fish_images.jsonl");
        const text = await response.text();
        const lines = text.split("\n").filter((line) => line.trim());
        const allFish: FishData[] = lines.map((line) => JSON.parse(line));

        // URL Paramsから絞り込み条件を取得
        // 例: /quiz?categories=魚類,軟体動物&rarities=4,5
        const categories =
          searchParams
            .get("categories")
            ?.split(",")
            .filter((c) => c) || [];
        const classifications =
          searchParams
            .get("classifications")
            ?.split(",")
            .filter((c) => c) || [];
        const rarities =
          searchParams
            .get("rarities")
            ?.split(",")
            .filter((r) => r)
            .map(Number) || [];

        // フィルタリング（AND条件）
        let filtered = allFish;
        if (
          categories.length > 0 ||
          classifications.length > 0 ||
          rarities.length > 0
        ) {
          filtered = allFish.filter((fish) => {
            const categoryMatch =
              categories.length === 0 || categories.includes(fish.category);
            const classificationMatch =
              classifications.length === 0 ||
              (fish.classification &&
                classifications.includes(fish.classification));
            const rarityMatch =
              rarities.length === 0 ||
              (fish.rarity !== null && rarities.includes(fish.rarity));
            return categoryMatch && classificationMatch && rarityMatch;
          });
        }

        setFishData(filtered);

        // フィルター設定を保存（復習時に使用）
        setFilterSettings({ categories, classifications, rarities });

        // ランダムに最大10問を選択（Fisher-Yatesアルゴリズム）
        const selectedQuestions = selectRandomFish(filtered, 10);
        setQuestions(selectedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load fish data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  /**
   * 入力変更ハンドラー
   */
  const handleAnswerChange = (answer: string) => {
    setUserAnswer(answer);
  };

  /**
   * 回答送信ハンドラー
   * 1. 正誤判定
   * 2. 正解数カウント更新
   * 3. 不正解の場合、復習用リストに追加
   */
  const handleSubmit = () => {
    if (isAnswered) return;

    const correct = checkAnswer(questions[currentIndex].name, userAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setCorrectCount((prev) => prev + 1);
    } else {
      // 間違えた問題を記録（復習機能用）
      setWrongQuestions((prev) => [...prev, questions[currentIndex]]);
    }
  };

  /**
   * 次の問題へ進む / 結果画面へ遷移するハンドラー
   * 最終問題の場合:
   * 1. スコア履歴保存（通常モードのみ）
   * 2. 復習データ保存（間違えた問題がある場合）
   * 3. 結果画面へ遷移
   */
  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // 次の問題へ
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer("");
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      // 最終問題: 結果画面へ遷移
      const params = new URLSearchParams();
      params.set("score", correctCount.toString());
      params.set("total", questions.length.toString());
      params.set("mode", quizMode);

      // 間違えた問題があればsessionStorageに保存（通常モード・復習モード共通）
      // これにより、結果画面から「間違えた問題だけやり直す」ボタンが利用可能になる
      if (wrongQuestions.length > 0) {
        saveRetryData(
          wrongQuestions,
          filterSettings,
          correctCount,
          questions.length,
        );
      }
      // 間違いがなければデータをクリア（全問正解の場合）
      else {
        clearRetryData();
      }

      router.push(`/result?${params.toString()}`);
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-cyan-100 text-lg">問題を準備中...</p>
        </div>
      </div>
    );
  }

  // 問題が0件の場合
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🐟</div>
          <h2 className="text-3xl font-bold text-cyan-100">
            該当する魚が見つかりません
          </h2>
          <p className="text-cyan-300/80">
            選択した条件に一致する魚がいませんでした。
            <br />
            条件を変更して再度お試しください。
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
          >
            設定画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizCard
      fish={questions[currentIndex]}
      currentIndex={currentIndex}
      totalQuestions={questions.length}
      userAnswer={userAnswer}
      isAnswered={isAnswered}
      isCorrect={isCorrect}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleSubmit}
      onNext={handleNext}
      mode={quizMode}
    />
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
            <p className="text-cyan-100 text-lg">読み込み中...</p>
          </div>
        </div>
      }
    >
      <QuizPageContent />
    </Suspense>
  );
}
