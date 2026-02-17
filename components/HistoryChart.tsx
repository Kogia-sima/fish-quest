/**
 * スコア履歴グラフコンポーネント
 * Rechartsライブラリを使用して正解率の推移を折れ線グラフで表示する
 * @module components/HistoryChart
 */
"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ScoreHistoryEntry } from "@/lib/types";

/**
 * HistoryChartコンポーネントのProps
 */
interface HistoryChartProps {
  /** スコア履歴エントリーの配列 */
  entries: ScoreHistoryEntry[];
}

/**
 * カスタムツールチップのProps
 */
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      percentage: number;
      score: number;
      total: number;
      date: string;
    };
  }>;
}

/**
 * スコア履歴をグラフで表示するコンポーネント
 * @param props HistoryChartProps
 */
export default function HistoryChart({ entries }: HistoryChartProps) {
  // データを古い順に並び替え（グラフのX軸は左→右が時系列順）
  // データ変換: ScoreHistoryEntry → グラフ表示用オブジェクト
  const chartData = [...entries].reverse().map((entry, index) => ({
    name: `#${index + 1}`, // グラフのX軸ラベル
    percentage: entry.percentage, // Y軸の値（正解率）
    date: new Date(entry.timestamp).toLocaleDateString("ja-JP", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    score: entry.score, // ツールチップ用
    total: entry.total, // ツールチップ用
  }));

  /**
   * グラフポイントにホバー時のカスタムツールチップ
   * 正解率、正解数/総数、日時を表示する
   */
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-blue-950/95 border-2 border-cyan-400/50 rounded-xl p-4 shadow-lg">
          <p className="text-cyan-100 font-bold text-lg mb-2">
            {payload[0].payload.percentage}%
          </p>
          <p className="text-cyan-200/80 text-sm">
            {payload[0].payload.score} / {payload[0].payload.total} 問正解
          </p>
          <p className="text-cyan-300/60 text-xs mt-1">
            {payload[0].payload.date}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(6, 182, 212, 0.1)"
          />
          <XAxis
            dataKey="name"
            stroke="rgba(6, 182, 212, 0.5)"
            style={{ fontSize: "12px" }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(6, 182, 212, 0.5)"
            style={{ fontSize: "12px" }}
            label={{
              value: "正解率 (%)",
              angle: -90,
              position: "insideLeft",
              fill: "rgba(6, 182, 212, 0.7)",
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="percentage"
            stroke="#06b6d4"
            strokeWidth={3}
            dot={{ fill: "#06b6d4", r: 5 }}
            activeDot={{ r: 7, fill: "#22d3ee" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
