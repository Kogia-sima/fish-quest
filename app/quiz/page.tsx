'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import QuizCard from '@/components/QuizCard';
import { FishData } from '@/lib/types';
import { selectRandomFish, checkAnswer } from '@/lib/quizLogic';

function QuizPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fishData, setFishData] = useState<FishData[]>([]);
  const [questions, setQuestions] = useState<FishData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // データの読み込みとフィルタリング
  useEffect(() => {
    const loadData = async () => {
      try {
        // クライアントサイドでJSONLを読み込む
        const response = await fetch('/fish_images.jsonl');
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        const allFish: FishData[] = lines.map(line => JSON.parse(line));

        // URL Paramsから絞り込み条件を取得
        const categories = searchParams.get('categories')?.split(',').filter(c => c) || [];
        const classifications = searchParams.get('classifications')?.split(',').filter(c => c) || [];
        const rarities = searchParams.get('rarities')?.split(',').filter(r => r).map(Number) || [];

        // フィルタリング
        let filtered = allFish;
        if (categories.length > 0 || classifications.length > 0 || rarities.length > 0) {
          filtered = allFish.filter(fish => {
            const categoryMatch = categories.length === 0 || categories.includes(fish.category);
            const classificationMatch =
              classifications.length === 0 ||
              (fish.classification && classifications.includes(fish.classification));
            const rarityMatch =
              rarities.length === 0 ||
              (fish.rarity !== null && rarities.includes(fish.rarity));
            return categoryMatch && classificationMatch && rarityMatch;
          });
        }

        setFishData(filtered);

        // ランダムに最大10問を選択
        const selectedQuestions = selectRandomFish(filtered, 10);
        setQuestions(selectedQuestions);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load fish data:', error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const handleAnswerChange = (answer: string) => {
    setUserAnswer(answer);
  };

  const handleSubmit = () => {
    if (isAnswered) return;

    const correct = checkAnswer(questions[currentIndex].name, userAnswer);
    setIsCorrect(correct);
    setIsAnswered(true);

    if (correct) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      // 次の問題へ
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setIsCorrect(null);
    } else {
      // 結果画面へ遷移
      const params = new URLSearchParams();
      params.set('score', correctCount.toString());
      params.set('total', questions.length.toString());
      router.push(`/result?${params.toString()}`);
    }
  };

  // ローディング画面
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto" />
          <p className="text-cyan-100 text-lg">問題を準備中...</p>
        </div>
      </div>
    );
  }

  // 問題が0件の場合
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 p-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="text-6xl mb-4">🐟</div>
          <h2 className="text-3xl font-bold text-cyan-100">該当する魚が見つかりません</h2>
          <p className="text-cyan-300/80">
            選択した条件に一致する魚がいませんでした。
            <br />
            条件を変更して再度お試しください。
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white text-lg font-bold rounded-2xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300"
          >
            設定画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <QuizCard
      fish={questions[currentIndex]}
      currentIndex={currentIndex}
      totalQuestions={questions.length}
      userAnswer={userAnswer}
      isAnswered={isAnswered}
      isCorrect={isCorrect}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleSubmit}
      onNext={handleNext}
    />
  );
}

export default function QuizPage() {
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
      <QuizPageContent />
    </Suspense>
  );
}
