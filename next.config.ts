import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // これを追加
  // 画像最適化 (next/image) を使う場合は、標準のサーバーが必要なため無効化するか
  // 外部ローダーの設定が必要です
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
