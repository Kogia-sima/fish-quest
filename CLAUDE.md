# プロジェクトガイド

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| パッケージマネージャー | pnpm |
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| UI | React |
| スタイリング | Tailwind CSS v4 |
| チャート | Recharts |
| リンター/フォーマッター | Biome |
| ユニットテスト | Vitest + happy-dom |
| コンポーネントテスト | Testing Library (React) |
| E2Eテスト | Playwright |
| デプロイ先 | Firebase Hosting |

## 主要な開発コマンド

```bash
pnpm dev              # 開発サーバー起動 (http://localhost:3000)
pnpm build            # プロダクションビルド (静的エクスポート → ./out/)
pnpm start            # プロダクションサーバー起動
pnpm lint             # コードチェック
pnpm format           # フォーマット
pnpm test:run         # 単体テスト実行
pnpm test:e2e         # E2Eテスト実行
pnpm deploy           # ビルド + Firebase Hosting デプロイ
```

## フォルダ構成

```
<project root directory>/
├── app/                         # Next.js App Router ページ
│   ├── layout.tsx               # ルートレイアウト (Server Component)
│   ├── page.tsx                 # ホーム/設定画面 (Server Component)
│   ├── globals.css              # グローバルCSS (Tailwind import)
│   └── <画面名>/
│       └── page.tsx             # 画面実装 (Client Component)
├── components/                  # UIコンポーネント
├── lib/                         # ビジネスロジック/ユーティリティ
├── test/                        # テストセットアップ
│   ├── setup.ts                 # Vitest セットアップ (モック/マッチャー拡張)
│   └── mocks/                   # テストモック
├── e2e/                         # E2Eテスト
├── public/                      # 静的アセット
└── README.md                    # プロジェクトドキュメント
```

## コーディング規約

### TypeScript

- **strict mode**: `tsconfig.json` で有効化
- **パスエイリアス**: `@/*` → プロジェクトルート (例: `@/lib/types`, `@/components/QuizCard`)
- **ターゲット**: ES2017
- **モジュール解決**: bundler

### ファイル命名規則

| 種類 | 命名 | 例 |
|------|------|-----|
| ページ | `page.tsx` | `app/quiz/page.tsx` |
| レイアウト | `layout.tsx` | `app/layout.tsx` |
| コンポーネント | PascalCase | `components/QuizCard.tsx` |
| ユーティリティ | camelCase | `lib/quizLogic.ts` |

### モジュール設計

- **型定義の集約**: `lib/types.ts` に全型を集約
- **ロジックとUIの分離**: `lib/` にビジネスロジック、`components/` にUI
- **テストの配置**: `lib/` 内にソースと同階層でテストファイルを配置
