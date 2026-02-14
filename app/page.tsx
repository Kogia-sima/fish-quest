import { loadFishData, getAllCategories, getAllClassifications, getAllRarities } from '@/lib/fishData';
import SettingsForm from '@/components/SettingsForm';

export default async function Home() {
  // Server Componentでデータを取得
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
