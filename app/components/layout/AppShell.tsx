import { ReactNode } from 'react';
import HeaderBar from '@/components/layout/HeaderBar';
import SidebarNav from '@/components/layout/SidebarNav';

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1680px] gap-5 px-4 py-4 lg:grid-cols-[290px_minmax(0,1fr)] lg:px-6 lg:py-6">
      <SidebarNav />
      <main className="space-y-5">
        <HeaderBar />
        {children}
      </main>
    </div>
  );
}
