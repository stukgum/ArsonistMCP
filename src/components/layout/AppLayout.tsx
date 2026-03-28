import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useAppStore } from '@/stores/appStore';
import { Toaster } from '@/components/features/Toaster';

export default function AppLayout() {
  const collapsed = useAppStore((s) => s.sidebarCollapsed);

  return (
    <div className="flex h-screen bg-void overflow-hidden">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          collapsed ? 'ml-[68px]' : 'ml-[240px]'
        }`}
      >
        <TopBar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  );
}
