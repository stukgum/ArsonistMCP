import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoadingScreen from '@/components/features/LoadingScreen';
import { useAppStore } from '@/stores/appStore';

const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Agents = lazy(() => import('@/pages/Agents'));
const Training = lazy(() => import('@/pages/Training'));
const Reports = lazy(() => import('@/pages/Reports'));
const Settings = lazy(() => import('@/pages/Settings'));

function NotFound() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <h2 className="font-display text-2xl font-bold text-neon mb-2">404</h2>
        <p className="text-sm text-[hsl(var(--text-secondary))]">Page not found</p>
      </div>
    </div>
  );
}

export default function App() {
  const initialize = useAppStore((state) => state.initialize);

  useEffect(() => {
    // Ensure a fresh dashboard + app state on every hard page load
    localStorage.removeItem('arsonist-mcp-store');

    // Initialize the app on startup
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path="/agents"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Agents />
            </Suspense>
          }
        />
        <Route
          path="/training"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Training />
            </Suspense>
          }
        />
        <Route
          path="/reports"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Reports />
            </Suspense>
          }
        />
        <Route
          path="/settings"
          element={
            <Suspense fallback={<LoadingScreen />}>
              <Settings />
            </Suspense>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
