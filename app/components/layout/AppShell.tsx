import { ReactNode } from 'react';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarNav from '@/components/layout/SidebarNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1820px] gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-6 lg:px-6 lg:py-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <SidebarNav />
      <main className="min-w-0 space-y-4 pb-16 sm:space-y-5 lg:space-y-6 lg:pb-10">
        <HeaderBar />
        {children}
      </main>
    </div>
  );
}
