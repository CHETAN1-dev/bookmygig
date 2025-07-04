import { Suspense } from 'react';
import ExplorePage from './Explorepage';

export default function ExploreWrapper() {
  return (
    <Suspense fallback={<p>Loading Explore Page...</p>}>
      <ExplorePage />
    </Suspense>
  );
}
