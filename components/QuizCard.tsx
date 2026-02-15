'use client';

import Image from 'next/image';
import { FishData, QuizMode } from '@/lib/types';

interface QuizCardProps {
  fish: FishData;
  currentIndex: number;
  totalQuestions: number;
  userAnswer: string;
  isAnswered: boolean;
  isCorrect: boolean | null;
  onAnswerChange: (answer: string) => void;
  onSubmit: () => void;
  onNext: () => void;
  mode?: QuizMode;
}

export default function QuizCard({
  fish,
  currentIndex,
  totalQuestions,
  userAnswer,
  isAnswered,
  isCorrect,
  onAnswerChange,
  onSubmit,
  onNext,
  mode = 'normal',
}: QuizCardProps) {
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Static background gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 100%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
          `
        }}
      />
      {/* Answer feedback overlays */}
      {isAnswered && isCorrect && (
        <div className="absolute inset-0 bg-emerald-500/5 animate-success-flash pointer-events-none" />
      )}
      {isAnswered && !isCorrect && (
        <div className="absolute inset-0 animate-error-shake pointer-events-none" />
      )}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-3xl">

          {/* Progress indicator */}
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg animate-pulse-glow ${
                mode === 'retry'
                  ? 'bg-gradient-to-br from-orange-400 to-rose-500 shadow-orange-500/50'
                  : 'bg-gradient-to-br from-cyan-400 to-blue-500 shadow-cyan-500/30'
              }`}>
                <span className="text-white font-bold">{currentIndex + 1}</span>
              </div>
              <span className="text-cyan-100 text-lg font-medium">
                / {totalQuestions}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex-1 mx-6 h-2 bg-blue-950/80 rounded-full overflow-hidden border border-cyan-500/20">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 ease-out shadow-lg shadow-cyan-500/50"
                style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Quiz Card */}
          <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-blue-900/70 border border-cyan-400/20 rounded-3xl shadow-2xl shadow-cyan-500/10 overflow-hidden animate-slide-up">

            {/* Fish Image */}
            <div className="relative aspect-[4/3] bg-gradient-to-br from-blue-950/80 to-cyan-950/80 p-6 sm:p-8">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/50">
                <Image
                  src={`/images/${fish.image_filename}`}
                  alt="魚の画像"
                  fill
                  className="object-contain"
                  priority={currentIndex === 0}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
                />
              </div>
            </div>

            {/* Question Section */}
            <div className="p-6 sm:p-8 lg:p-10 space-y-6">
              <div className="text-center animate-fade-in-delayed">
                <h2 className="text-2xl sm:text-3xl font-bold text-cyan-100 mb-2">
                  この魚の名前は？
                </h2>
                <p className="text-cyan-300/60 text-sm">
                  {isAnswered ? '回答済み' : '名前を入力してください'}
                </p>
              </div>

              {/* Answer Input */}
              <div className="space-y-4 animate-fade-in-delayed-2">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => onAnswerChange(e.target.value)}
                  disabled={isAnswered}
                  placeholder="魚の名前を入力..."
                  className="w-full px-6 py-4 bg-blue-950/80 border-2 border-cyan-500/30 rounded-2xl text-cyan-50 placeholder-cyan-400/40 focus:border-cyan-400 focus:outline-none focus:ring-4 focus:ring-cyan-400/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg disabled:bg-blue-950/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isAnswered) {
                      onSubmit();
                    }
                  }}
                />

                {/* Submit Button (before answer) */}
                {!isAnswered && (
                  <button
                    onClick={onSubmit}
                    className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] animate-fade-in-delayed-3"
                  >
                    回答する
                  </button>
                )}
              </div>

              {/* Result Display (after answer) */}
              {isAnswered && (
                <div className="space-y-4 animate-result-appear">
                  {/* Correct/Incorrect indicator */}
                  <div
                    className={`p-6 rounded-2xl border-2 ${
                      isCorrect
                        ? 'bg-emerald-500/20 border-emerald-400/50 animate-success-pulse'
                        : 'bg-rose-500/20 border-rose-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-3 mb-3">
                      {isCorrect ? (
                        <>
                          <span className="text-5xl animate-bounce-in">✓</span>
                          <span className="text-2xl sm:text-3xl font-bold text-emerald-300">
                            正解！
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-5xl animate-shake">✗</span>
                          <span className="text-2xl sm:text-3xl font-bold text-rose-300">
                            不正解
                          </span>
                        </>
                      )}
                    </div>

                    {!isCorrect && (
                      <div className="text-center pt-3 border-t border-white/10">
                        <p className="text-cyan-200/80 text-sm mb-2">正解は</p>
                        <p className="text-2xl font-bold text-cyan-100 animate-fade-in-delayed">
                          {fish.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={onNext}
                    className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isLastQuestion ? '結果を見る 🎉' : '次へ 🐟'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Hint text */}
          {!isAnswered && (
            <p className="text-center text-cyan-300/50 text-sm mt-6 animate-fade-in-delayed-5">
              未入力でも回答できます
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 30px rgba(34, 211, 238, 0.6); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-delayed {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes success-flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
        @keyframes success-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        @keyframes error-shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes bounce-in {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); }
        }
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-10deg); }
          75% { transform: rotate(10deg); }
        }
        @keyframes result-appear {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-delayed { animation: fade-in-delayed 0.8s ease-out 0.2s both; }
        .animate-fade-in-delayed-2 { animation: fade-in 0.6s ease-out 0.2s both; }
        .animate-fade-in-delayed-3 { animation: fade-in 0.6s ease-out 0.3s both; }
        .animate-fade-in-delayed-5 { animation: fade-in 0.6s ease-out 0.5s both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-success-flash { animation: success-flash 1s ease-out; }
        .animate-success-pulse { animation: success-pulse 0.5s ease-out; }
        .animate-error-shake { animation: error-shake 0.5s ease-out; }
        .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-result-appear { animation: result-appear 0.5s ease-out; }

        /* モバイル端末ではアニメーション完全無効化 + パフォーマンス最適化 */
        @media (max-width: 768px) {
          /* すべてのアニメーションを無効化 */
          .animate-fade-in,
          .animate-fade-in-delayed,
          .animate-fade-in-delayed-2,
          .animate-fade-in-delayed-3,
          .animate-fade-in-delayed-5,
          .animate-slide-up,
          .animate-pulse-glow,
          .animate-success-flash,
          .animate-success-pulse,
          .animate-error-shake,
          .animate-bounce-in,
          .animate-shake,
          .animate-result-appear {
            animation: none !important;
          }

          /* shadowを軽量化 */
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
          }
          .shadow-lg {
            box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1) !important;
          }

          /* transition-allを無効化 */
          .transition-all {
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
        }
      `}</style>
    </div>
  );
}
