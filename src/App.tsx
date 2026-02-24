import { lazy, Suspense } from 'react';
import LoadingSkeleton from './components/LoadingSkeleton';

const MetroMap = lazy(() => import('./components/MetroMap'));

function App() {
  return (
    <main className="w-full h-full">
      <Suspense fallback={<LoadingSkeleton />}>
        <MetroMap />
      </Suspense>
    </main>
  );
}

export default App;
