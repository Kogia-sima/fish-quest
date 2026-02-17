/**
 * クイズ結果ページ
 * URL Paramsからスコアを取得し、ResultDisplayコンポーネントで表示する
 * 再挑戦ボタンと復習ボタンを提供する
 * @module app/result/page
 */
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import ResultDisplay from "@/components/ResultDisplay";
import { saveScoreHistory } from "@/lib/historyLogic";
import { loadRetryData } from "@/lib/quizLogic";
import type { QuizMode } from "@/lib/types";

/**
 * 結果ページのメインコンテンツコンポーネント
 */
function ResultPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Paramsからスコアと設定を取得
  // 例: /result?score=8&total=10&mode=normal
  const score = parseInt(searchParams.get("score") || "0", 10);
  const total = parseInt(searchParams.get("total") || "0", 10);
  const mode = (searchParams.get("mode") as QuizMode) || "normal";
  const [hasRetryData, setHasRetryData] = useState(false);
  const hasSavedHistory = useRef(false); // 重複保存防止用フラグ

  // sessionStorageに復習データがあるか確認
  useEffect(() => {
    const retryData = loadRetryData();
    setHasRetryData(retryData !== null && retryData.questions.length > 0);
  }, []);

  // スコア履歴を保存（通常モードのみ、1回のみ実行）
  // 復習モードではスコア履歴を保存しない（元のクイズ結果と重複するため）
  useEffect(() => {
    if (
      mode === "normal" &&
      !Number.isNaN(score) &&
      !Number.isNaN(total) &&
      total > 0 &&
      !hasSavedHistory.current
    ) {
      saveScoreHistory(score, total, mode);
      hasSavedHistory.current = true;
    }
  }, [score, total, mode]);

  /**
   * 再挑戦ボタンのハンドラー
   * トップ画面（設定画面）に戻る
   */
  const handleRetry = () => {
    router.push("/");
  };

  /**
   * 復習ボタンのハンドラー
   * 間違えた問題のみで復習クイズを開始（sessionStorageから取得）
   */
  const handleRetryWrong = () => {
    router.push("/quiz?mode=retry");
  };

  // バリデーション
  if (Number.isNaN(score) || Number.isNaN(total) || total === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🐟</div>
          <h2 className="text-3xl font-bold text-cyan-100">
            データが見つかりません
          </h2>
          <p className="text-cyan-300/80">
            正しいデータが取得できませんでした。
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
          >
            設定画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <ResultDisplay
      score={score}
      total={total}
      onRetry={handleRetry}
      onRetryWrong={hasRetryData ? handleRetryWrong : undefined}
      mode={mode}
    />
  );
}

export default function ResultPage() {
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
      <ResultPageContent />
    </Suspense>
  );
}
