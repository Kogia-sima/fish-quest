/**
 * ホームページ（設定画面）
 * Server Componentとしてサーバーサイドで魚データを読み込み、
 * SettingsFormコンポーネントに渡す
 * @module app/page
 */
import { loadFishData, getAllCategories, getAllClassifications, getAllRarities } from '@/lib/fishData';
import SettingsForm from '@/components/SettingsForm';

/**
 * ホームページのメインコンポーネント（Server Component）
 */
export default async function Home() {
  // Server Componentでデータを取得（サーバーサイドでJSONL読み込み）
  const fishData = await loadFishData();
  const allCategories = getAllCategories(fishData);
  const allClassifications = getAllClassifications(fishData);
  const allRarities = getAllRarities(fishData);

  return (
    <SettingsForm
      allCategories={allCategories}
      allClassifications={allClassifications}
      allRarities={allRarities}
      fishData={fishData}
    />
  );
}
