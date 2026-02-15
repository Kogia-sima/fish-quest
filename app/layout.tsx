/**
 * ルートレイアウト
 * アプリケーション全体の共通レイアウトとメタデータを定義する
 * @module app/layout
 */
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Geistフォントの設定（可変フォント）
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// アプリケーションのメタデータ
export const metadata: Metadata = {
  title: "魚の名前当てクイズ",
  description: "905種類の魚から名前を当てるクイズアプリケーション",
};

/**
 * ルートレイアウトコンポーネント
 * @param children 子コンポーネント
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
