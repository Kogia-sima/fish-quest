'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { FishData } from '@/lib/types';
import { getClassificationsByCategories, filterFishData } from '@/lib/fishUtils';
import { clearRetryData } from '@/lib/quizLogic';

interface SettingsFormProps {
  allCategories: string[];
  allClassifications: string[];
  allRarities: number[];
  fishData: FishData[];
}

// Helper functions
function sortWithOtherLast(items: string[]): string[] {
  const others = items.filter(item => item === 'その他');
  const nonOthers = items.filter(item => item !== 'その他').sort();
  return [...nonOthers, ...others];
}

// Custom hooks
function useToggleSelection<T>(initialValue: T[] = []) {
  const [selected, setSelected] = useState<T[]>(initialValue);

  const toggle = useCallback((item: T) => {
    setSelected(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  }, []);

  return { selected, setSelected, toggle };
}

function useClickOutside(
  ref: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  onClose: () => void,
  dataAttribute: string
) {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !(target as Element).closest(`[data-dropdown="${dataAttribute}"]`)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, ref, onClose, dataAttribute]);
}

// Shared components
interface DropdownPortalProps {
  isOpen: boolean;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  children: React.ReactNode;
  dataDropdown: string;
}

function DropdownPortal({ isOpen, buttonRef, children, dataDropdown }: DropdownPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  // Set mounted to true after first render to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const updatePosition = () => {
        const rect = buttonRef.current?.getBoundingClientRect();
        if (rect) {
          setPosition({
            top: rect.bottom + 8,
            left: rect.left,
            width: rect.width,
          });
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, buttonRef]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed z-[90] max-h-64 overflow-y-auto bg-slate-900 border-2 border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-500/20 animate-dropdown-open"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
      }}
      data-dropdown={dataDropdown}
    >
      {children}
    </div>,
    document.body
  );
}

interface SelectedChipsProps<T> {
  items: T[];
  onRemove: (item: T) => void;
  renderLabel: (item: T) => string;
  colorClass: string;
}

function SelectedChips<T>({ items, onRemove, renderLabel, colorClass }: SelectedChipsProps<T>) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
      {items.map((item, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-4 py-2 ${colorClass} rounded-full text-sm text-cyan-100 transition-all duration-300`}
        >
          {renderLabel(item)}
          <button
            onClick={() => onRemove(item)}
            className="ml-2 hover:text-cyan-300 transition-colors"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

interface FilterDropdownProps<T> {
  label: string;
  items: T[];
  selectedItems: T[];
  onToggle: (item: T) => void;
  renderLabel: (item: T) => string;
  placeholder: string;
  emptyPlaceholder?: string;
  disabled?: boolean;
  dataDropdown: string;
  chipColorClass: string;
  delayClass: string;
}

function FilterDropdown<T>({
  label,
  items,
  selectedItems,
  onToggle,
  renderLabel,
  placeholder,
  emptyPlaceholder,
  disabled = false,
  dataDropdown,
  chipColorClass,
  delayClass,
}: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useClickOutside(buttonRef, isOpen, () => setIsOpen(false), dataDropdown);

  const buttonText = disabled && items.length === 0
    ? emptyPlaceholder || placeholder
    : selectedItems.length === 0
      ? placeholder
      : `${selectedItems.length}個を選択中`;

  return (
    <div className={`space-y-3 ${delayClass}`}>
      <label className="block text-cyan-100 text-lg font-medium mb-3">
        {label}
      </label>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="w-full px-5 py-4 bg-blue-950/80 border-2 border-cyan-500/30 rounded-2xl text-left text-cyan-50 hover:border-cyan-400/50 focus:border-cyan-400 focus:outline-none transition-all duration-300 hover:bg-blue-950/90 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-cyan-500/30"
        >
          <span className="flex-1">{buttonText}</span>
          <svg
            className={`w-5 h-5 text-cyan-400 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {items.length > 0 && (
          <DropdownPortal isOpen={isOpen} buttonRef={buttonRef} dataDropdown={dataDropdown}>
            <div className="p-2">
              {items.map((item, index) => (
                <label
                  key={index}
                  className="flex items-center px-4 py-3 bg-slate-900/80 hover:bg-cyan-500/30 rounded-xl cursor-pointer transition-all duration-200 group"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item)}
                    onChange={() => onToggle(item)}
                    className="w-5 h-5 rounded border-2 border-cyan-400/50 text-cyan-500 focus:ring-2 focus:ring-cyan-400 focus:ring-offset-0 bg-blue-950/60 cursor-pointer"
                  />
                  <span className="ml-3 text-cyan-50 group-hover:text-cyan-200 transition-colors">
                    {renderLabel(item)}
                  </span>
                </label>
              ))}
            </div>
          </DropdownPortal>
        )}
      </div>

      <SelectedChips
        items={selectedItems}
        onRemove={onToggle}
        renderLabel={renderLabel}
        colorClass={chipColorClass}
      />
    </div>
  );
}

export default function SettingsForm({
  allCategories,
  allClassifications,
  allRarities,
  fishData,
}: SettingsFormProps) {
  const router = useRouter();
  const { selected: selectedCategories, setSelected: setSelectedCategories, toggle: toggleCategory } = useToggleSelection<string>();
  const { selected: selectedClassifications, setSelected: setSelectedClassifications, toggle: toggleClassification } = useToggleSelection<string>();
  const { selected: selectedRarities, toggle: toggleRarity } = useToggleSelection<number>();

  // 選択されたカテゴリーに基づいて利用可能な分類を動的に取得
  const availableClassifications = useMemo(() => {
    return getClassificationsByCategories(fishData, selectedCategories);
  }, [fishData, selectedCategories]);

  // カテゴリーが変更されたら、無効な分類を削除
  useEffect(() => {
    setSelectedClassifications(prev =>
      prev.filter(c => availableClassifications.includes(c))
    );
  }, [availableClassifications, setSelectedClassifications]);

  // フィルタリングされた魚の数を計算
  const filteredCount = useMemo(() => {
    return filterFishData(fishData, selectedCategories, selectedClassifications, selectedRarities).length;
  }, [fishData, selectedCategories, selectedClassifications, selectedRarities]);

  const handleStartQuiz = () => {
    if (filteredCount === 0) return;

    // 古い復習データをクリア
    clearRetryData();

    const params = new URLSearchParams();
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
    }
    if (selectedClassifications.length > 0) {
      params.set('classifications', selectedClassifications.join(','));
    }
    if (selectedRarities.length > 0) {
      params.set('rarities', selectedRarities.join(','));
    }
    router.push(`/quiz?${params.toString()}`);
  };

  // カテゴリーと分類をソート（「その他」を最後に）
  const sortedCategories = useMemo(() => sortWithOtherLast(allCategories), [allCategories]);
  const sortedClassifications = useMemo(() => sortWithOtherLast(availableClassifications), [availableClassifications]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 dark:from-black dark:via-blue-950 dark:to-slate-950">
      {/* Static background gradient */}
      <div className="absolute inset-0 pointer-events-none -z-10"
        style={{
          background: `
            radial-gradient(circle at 25% 0%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 75% 100%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.04) 0%, transparent 50%)
          `
        }}
      />

      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl">
          {/* Title with ocean wave effect */}
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent animate-wave-gradient">
              🐠 魚の名前当てクイズ
            </h1>
            <p className="text-cyan-200/80 text-lg sm:text-xl font-light">
              伊豆半島編
            </p>
          </div>

          {/* Settings Card */}
          <div className="bg-gradient-to-br from-blue-900/70 via-cyan-900/60 to-blue-900/70 border border-cyan-400/20 rounded-3xl shadow-2xl shadow-cyan-500/10 p-6 sm:p-8 lg:p-10 space-y-8 animate-slide-up">

            {/* Category Selector */}
            <FilterDropdown
              label="カテゴリーで絞り込み"
              items={sortedCategories}
              selectedItems={selectedCategories}
              onToggle={toggleCategory}
              renderLabel={(item) => item}
              placeholder="すべてのカテゴリー"
              dataDropdown="category"
              chipColorClass="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 hover:from-cyan-500/30 hover:to-blue-500/30"
              delayClass="animate-fade-in-delayed-1"
            />

            {/* Classification Selector */}
            <FilterDropdown
              label="分類で絞り込み"
              items={sortedClassifications}
              selectedItems={selectedClassifications}
              onToggle={toggleClassification}
              renderLabel={(item) => item}
              placeholder="すべての分類"
              emptyPlaceholder="カテゴリーを選択してください"
              disabled={availableClassifications.length === 0}
              dataDropdown="classification"
              chipColorClass="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-400/30 hover:from-teal-500/30 hover:to-cyan-500/30"
              delayClass="animate-fade-in-delayed-2"
            />

            {/* Rarity Selector */}
            <FilterDropdown
              label="レア度で絞り込み"
              items={allRarities}
              selectedItems={selectedRarities}
              onToggle={toggleRarity}
              renderLabel={(rarity) => `★ ${rarity}`}
              placeholder="すべてのレア度"
              dataDropdown="rarity"
              chipColorClass="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 hover:from-yellow-500/30 hover:to-orange-500/30"
              delayClass="animate-fade-in-delayed-3"
            />

            {/* Fish Count Display */}
            <div className="flex items-center justify-center p-6 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-cyan-500/10 rounded-2xl border border-cyan-400/20 animate-fade-in-delayed-4">
              <div className="text-center">
                <p className="text-cyan-200/80 text-sm mb-2">対象の魚</p>
                <p className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent">
                  {filteredCount}
                </p>
                <p className="text-cyan-200/80 text-sm mt-2">種類</p>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartQuiz}
              disabled={filteredCount === 0}
              className="w-full py-5 px-8 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-xl font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 disabled:shadow-none transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 disabled:opacity-50 animate-fade-in-delayed-5"
            >
              {filteredCount === 0 ? '魚を選択してください' : 'クイズを始める 🐟'}
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-cyan-300/50 text-sm mt-6 animate-fade-in-delayed-6">
            選択しない場合は、すべての魚からランダムに出題されます
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
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdown-open {
          from { opacity: 0; transform: translateY(-10px) scaleY(0.95); }
          to { opacity: 1; transform: translateY(0) scaleY(1); }
        }

        .animate-wave-gradient {
          background-size: 200% 200%;
          animation: wave-gradient 4s ease infinite;
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-delayed-1 { animation: fade-in 0.6s ease-out 0.1s both; }
        .animate-fade-in-delayed-2 { animation: fade-in 0.6s ease-out 0.2s both; }
        .animate-fade-in-delayed-3 { animation: fade-in 0.6s ease-out 0.3s both; }
        .animate-fade-in-delayed-4 { animation: fade-in 0.6s ease-out 0.4s both; }
        .animate-fade-in-delayed-5 { animation: fade-in 0.6s ease-out 0.5s both; }
        .animate-fade-in-delayed-6 { animation: fade-in 0.6s ease-out 0.6s both; }
        .animate-slide-up { animation: slide-up 0.8s ease-out; }
        .animate-dropdown-open {
          animation: dropdown-open 0.3s ease-out;
          transform-origin: top center;
        }

        /* モバイル端末ではアニメーション完全無効化 + パフォーマンス最適化 */
        @media (max-width: 768px) {
          /* すべてのアニメーションを無効化 */
          .animate-fade-in,
          .animate-fade-in-delayed-1,
          .animate-fade-in-delayed-2,
          .animate-fade-in-delayed-3,
          .animate-fade-in-delayed-4,
          .animate-fade-in-delayed-5,
          .animate-fade-in-delayed-6,
          .animate-slide-up,
          .animate-dropdown-open,
          .animate-wave-gradient {
            animation: none !important;
          }

          /* shadowを軽量化 */
          .shadow-2xl {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
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
