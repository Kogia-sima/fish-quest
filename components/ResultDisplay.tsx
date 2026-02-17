/**
 * クイズ結果表示コンポーネント
 *
 * 主な機能:
 * - スコアの円形グラフアニメーション
 * - 正解率に応じた色・メッセージ・絵文字の動的変更
 * - 復習モードのサポート
 * - 高得点時の紙吹雪エフェクト
 *
 * @module components/ResultDisplay
 */
"use client";

import { useEffect, useState } from "react";
import { getScoreMessage } from "@/lib/quizLogic";
import type { QuizMode } from "@/lib/types";

/**
 * ResultDisplayコンポーネントのProps
 */
interface ResultDisplayProps {
  /** 正解数 */
  score: number;
  /** 総問題数 */
  total: number;
  /** 再挑戦のコールバック */
  onRetry: () => void;
  /** 間違えた問題のみ復習するコールバック（オプション） */
  onRetryWrong?: () => void;
  /** クイズモード（'normal' | 'retry'） */
  mode?: QuizMode;
}

/**
 * クイズ結果を表示するメインコンポーネント
 * @param props ResultDisplayProps
 */
export default function ResultDisplay({
  score,
  total,
  onRetry,
  onRetryWrong,
  mode = "normal",
}: ResultDisplayProps) {
  const wrongCount = total - score;
  const isRetryMode = mode === "retry";
  const [animatedScore, setAnimatedScore] = useState(0);
  const percentage = Math.round((score / total) * 100);
  const message = getScoreMessage(score, total);

  // カウントアップアニメーション
  // 約1.5秒かけて0からscoreまで滑らかにカウントアップする
  // 16msごとにincrementを加算（約60fps相当）
  useEffect(() => {
    let start = 0;
    const duration = 1500; // アニメーション時間（ミリ秒）
    const increment = score / (duration / 16); // 1フレームあたりの増加量

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setAnimatedScore(score); // 最終値に到達
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(start));
      }
    }, 16); // 約60fps

    return () => clearInterval(timer);
  }, [score]);

  /**
   * スコアの正解率に応じたビジュアルスタイルを決定する
   * @returns スタイルオブジェクト
   * @returns {string} gradient テキストグラデーションクラス
   * @returns {string} ringColor 円形グラフの色
   * @returns {string} emoji 表示絵文字
   * @returns {string} bgGlow 背景グロー効果のクラス
   *
   * スコア区分:
   * - 100%: 金色、トロフィー🏆
   * - 80%以上: エメラルド、お祝い🎉
   * - 60%以上: シアン、Good👍
   * - 40%以上: オレンジ、頑張れ💪
   * - 40%未満: ローズ、勉強📚
   */
  const getScoreStyle = () => {
    if (percentage === 100) {
      return {
        gradient: "from-amber-400 via-yellow-300 to-amber-400",
        ringColor: "#fbbf24",
        emoji: "🏆",
        bgGlow: "bg-yellow-500/20",
      };
    } else if (percentage >= 80) {
      return {
        gradient: "from-emerald-400 via-cyan-400 to-emerald-400",
        ringColor: "#10b981",
        emoji: "🎉",
        bgGlow: "bg-emerald-500/20",
      };
    } else if (percentage >= 60) {
      return {
        gradient: "from-cyan-400 via-blue-400 to-cyan-400",
        ringColor: "#06b6d4",
        emoji: "👍",
        bgGlow: "bg-cyan-500/20",
      };
    } else if (percentage >= 40) {
      return {
        gradient: "from-yellow-400 via-orange-400 to-yellow-400",
        ringColor: "#f59e0b",
        emoji: "💪",
        bgGlow: "bg-orange-500/20",
      };
    } else {
      return {
        gradient: "from-rose-400 via-pink-400 to-rose-400",
        ringColor: "#f43f5e",
        emoji: "📚",
        bgGlow: "bg-rose-500/20",
      };
    }
  };

  const style = getScoreStyle();
  // SVG円形グラフの計算
  // 円周 = 2πr（r=120）
  const circumference = 2 * Math.PI * 120;
  // strokeDashoffset = 正解率に応じて円弧の長さを調整
  // 例: 80%なら、円周の80%分を描画
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Static background gradient with score-based glow */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(circle at 25% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 75% 100%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
            `,
          }}
        />
        <div className={`absolute inset-0 ${style.bgGlow} opacity-40`} />

        {/* Confetti for high scores */}
        {percentage >= 80 &&
          [...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full animate-confetti"
              style={{
                left: `${Math.random() * 100}%`,
                top: "-20px",
                backgroundColor: ["#fbbf24", "#10b981", "#06b6d4", "#f59e0b"][
                  Math.floor(Math.random() * 4)
                ],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            />
          ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Title */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-wave-gradient">
              🎊 結果発表
            </h1>
          </div>

          {/* Result Card */}
          <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-blue-900/70 border border-cyan-400/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-8 sm:p-10 lg:p-12 space-y-10 animate-slide-up">
            {/* Score Circle */}
            <div className="relative w-80 h-80 mx-auto animate-scale-in">
              {/* Background circle */}
              <svg
                className="absolute inset-0 transform -rotate-90"
                width="100%"
                height="100%"
                viewBox="0 0 280 280"
              >
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-blue-950/60"
                />
                {/* Progress circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke={style.ringColor}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-2000 ease-out drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                  style={{
                    animation: "drawCircle 2s ease-out forwards",
                  }}
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3">
                <div
                  className="text-7xl animate-bounce-in"
                  style={{ animationDelay: "0.5s" }}
                >
                  {style.emoji}
                </div>
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent animate-count-up">
                    {animatedScore}
                  </div>
                  <div className="text-2xl text-cyan-200/60 font-light">
                    / {total}
                  </div>
                </div>
                <div
                  className={`text-3xl font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent animate-fade-in-delayed-3`}
                >
                  {percentage}%
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="text-center space-y-4 animate-fade-in-delayed-2">
              <h2
                className={`text-4xl sm:text-5xl font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}
              >
                {message}
              </h2>
              <p className="text-cyan-200/80 text-lg">
                {percentage === 100 && "全問正解！完璧です！"}
                {percentage >= 80 &&
                  percentage < 100 &&
                  "ほとんど正解！素晴らしい成績です！"}
                {percentage >= 60 && percentage < 80 && "良い成績です！"}
                {percentage >= 50 &&
                  percentage < 60 &&
                  "半分以上正解できました！"}
                {percentage < 50 && "もう一度挑戦してみましょう！"}
              </p>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-3 gap-4 animate-fade-in-delayed-4">
              <div className="bg-blue-950/40 rounded-2xl p-4 border border-cyan-500/20 text-center">
                <div className="text-3xl font-bold text-emerald-400">
                  {score}
                </div>
                <div className="text-sm text-cyan-200/60 mt-1">正解</div>
              </div>
              <div className="bg-blue-950/40 rounded-2xl p-4 border border-cyan-500/20 text-center">
                <div className="text-3xl font-bold text-rose-400">
                  {total - score}
                </div>
                <div className="text-sm text-cyan-200/60 mt-1">不正解</div>
              </div>
              <div className="bg-blue-950/40 rounded-2xl p-4 border border-cyan-500/20 text-center">
                <div className="text-3xl font-bold text-cyan-400">{total}</div>
                <div className="text-sm text-cyan-200/60 mt-1">総問題数</div>
              </div>
            </div>

            {/* 復習可能な問題数 */}
            {wrongCount > 0 && (
              <p className="text-sm text-cyan-300/60 text-center -mt-4 animate-fade-in-delayed-4">
                {wrongCount}問の復習が可能です
              </p>
            )}

            {/* Retry buttons */}
            <div className="space-y-3">
              {/* 復習ボタン（間違いありの場合に表示） */}
              {onRetryWrong && wrongCount > 0 && (
                <button
                  type="button"
                  onClick={onRetryWrong}
                  className="w-full py-5 px-8 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 text-white text-xl font-bold rounded-2xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-delayed-5"
                >
                  {isRetryMode
                    ? "間違えた問題をさらにやり直す 📝"
                    : "間違えた問題だけやり直す 📝"}{" "}
                  ({wrongCount}問)
                </button>
              )}

              {/* 通常の再挑戦ボタン */}
              <button
                type="button"
                onClick={onRetry}
                className="w-full py-5 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-xl font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-delayed-5"
              >
                トップ画面に戻る 🐟
              </button>
            </div>
          </div>

          {/* Footer message */}
          <p className="text-center text-cyan-300/60 text-sm mt-6 animate-fade-in-delayed-6">
            設定を変えて、いろいろな魚に挑戦してみましょう
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave-gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes count-up {
          from { opacity: 0; transform: scale(0.5); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
        @keyframes drawCircle {
          from {
            stroke-dashoffset: ${circumference};
          }
          to {
            stroke-dashoffset: ${strokeDashoffset};
          }
        }

        .animate-wave-gradient {
          background-size: 200% 200%;
          animation: wave-gradient 4s ease infinite;
        }
        .animate-fade-in { animation: fade-in 0.8s ease-out; }
        .animate-fade-in-delayed-2 { animation: fade-in 0.8s ease-out 1s both; }
        .animate-fade-in-delayed-3 { animation: fade-in 0.8s ease-out 1.5s both; }
        .animate-fade-in-delayed-4 { animation: fade-in 0.8s ease-out 2s both; }
        .animate-fade-in-delayed-5 { animation: fade-in 0.8s ease-out 2.5s both; }
        .animate-fade-in-delayed-6 { animation: fade-in 0.8s ease-out 3s both; }
        .animate-slide-up { animation: slide-up 1s ease-out; }
        .animate-scale-in { animation: scale-in 1s ease-out 0.3s both; }
        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) 0.5s both; }
        .animate-count-up { animation: count-up 1s ease-out 0.8s both; }
        .animate-confetti { animation: confetti linear forwards; }

        .transition-all.duration-2000 {
          transition-duration: 2000ms;
        }

        /* モバイル端末ではアニメーション完全無効化 + パフォーマンス最適化 */
        @media (max-width: 768px) {
          /* すべてのアニメーションを無効化 */
          .animate-fade-in,
          .animate-fade-in-delayed-2,
          .animate-fade-in-delayed-3,
          .animate-fade-in-delayed-4,
          .animate-fade-in-delayed-5,
          .animate-fade-in-delayed-6,
          .animate-slide-up,
          .animate-scale-in,
          .animate-bounce-in,
          .animate-count-up,
          .animate-wave-gradient {
            animation: none !important;
          }
          .animate-confetti {
            display: none !important;
          }

          /* shadowを軽量化 */
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }

          /* transition-allを無効化 */
          .transition-all {
            transition: none !important;
          }
          .transition-all.duration-2000 {
            transition: none !important;
          }
        }

        /* ユーザーがアニメーション削減を希望する場合は無効化 */
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
          .transition-all {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}
