import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";

// Testing Libraryマッチャーを拡張
expect.extend(matchers);

// 各テスト後のクリーンアップ
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// StorageAPIのモッククラス
class StorageMock {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }
}

// ブラウザAPIのモック
beforeEach(() => {
  // StorageAPIのモック
  global.localStorage = new StorageMock() as any;
  global.sessionStorage = new StorageMock() as any;

  // コンソールメソッドをモック（テストノイズを削減）
  global.console = {
    ...console,
    error: vi.fn(),
    warn: vi.fn(),
  };
});
