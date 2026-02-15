'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadScoreHistory, clearScoreHistory } from '@/lib/historyLogic';
import { ScoreHistoryEntry } from '@/lib/types';
import HistoryChart from '@/components/HistoryChart';

export default function HistoryPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<ScoreHistoryEntry[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const history = loadScoreHistory();
    setEntries(history.entries);
  }, []);

  const handleDelete = () => {
    clearScoreHistory();
    setEntries([]);
    setShowDeleteConfirm(false);
  };

  const handleBack = () => {
    router.push('/');
  };

  const averagePercentage = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + e.percentage, 0) / entries.length)
    : 0;
  const bestPercentage = entries.length > 0
    ? Math.max(...entries.map(e => e.percentage))
    : 0;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 25% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 100%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)
          `
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              📊 スコア履歴
            </h1>
          </div>

          {/* History Card */}
          <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-blue-900/70 border border-cyan-400/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 lg:p-10 space-y-8">
            {entries.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="text-6xl mb-4">📈</div>
                <h2 className="text-2xl font-bold text-cyan-100">履歴がありません</h2>
                <p className="text-cyan-200/60">
                  クイズに挑戦すると、正解率の履歴が記録されます
                </p>
              </div>
            ) : (
              <>
                {/* Chart */}
                <HistoryChart entries={entries} />

                {/* Stats summary */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-cyan-400/20">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-300">{entries.length}</div>
                    <div className="text-sm text-cyan-200/60 mt-1">挑戦回数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-emerald-300">
                      {averagePercentage}%
                    </div>
                    <div className="text-sm text-cyan-200/60 mt-1">平均正解率</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-yellow-300">
                      {bestPercentage}%
                    </div>
                    <div className="text-sm text-cyan-200/60 mt-1">最高正解率</div>
                  </div>
                </div>

                {/* Delete button */}
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full py-4 px-8 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    履歴を削除する 🗑️
                  </button>
                ) : (
                  <div className="space-y-3 p-6 bg-rose-500/10 border border-rose-400/30 rounded-2xl">
                    <p className="text-center text-rose-200 font-medium">
                      本当に削除しますか？この操作は取り消せません。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="py-3 px-6 bg-blue-950/80 hover:bg-blue-950 text-cyan-100 font-bold rounded-xl transition-all duration-300"
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleDelete}
                        className="py-3 px-6 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400 text-white font-bold rounded-xl transition-all duration-300"
                      >
                        削除する
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Back button */}
            <button
              onClick={handleBack}
              className="w-full py-4 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              トップ画面に戻る 🐟
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
