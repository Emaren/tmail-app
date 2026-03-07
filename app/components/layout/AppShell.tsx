import { ReactNode } from 'react';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarNav from '@/components/layout/SidebarNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1760px] gap-4 px-3 py-3 sm:px-4 sm:py-4 xl:grid-cols-[320px_minmax(0,1fr)] xl:gap-7 xl:px-6 xl:py-6 2xl:px-8 2xl:py-8">
      <SidebarNav />
      <main className="min-w-0 space-y-5 pb-16 sm:space-y-6 lg:space-y-7 lg:pb-12"> 
        <HeaderBar />
        {children}
      </main>
    </div>
  );
}
