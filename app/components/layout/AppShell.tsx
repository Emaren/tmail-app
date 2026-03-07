import { ReactNode } from 'react';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarNav from '@/components/layout/SidebarNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1820px] gap-4 px-3 py-3 sm:px-4 sm:py-4 xl:grid-cols-[318px_minmax(0,1fr)] xl:gap-6 xl:px-6 xl:py-6">
      <SidebarNav />
      <main className="min-w-0 space-y-4 pb-16 sm:space-y-5 lg:space-y-6 lg:pb-10">
        <HeaderBar />
        {children}
      </main>
    </div>
  );
}
