'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems, resolveNavItem } from '@/lib/navigation';

const quickActionHrefs = new Set([
  '/dashboard/compose',
  '/dashboard/messages',
  '/dashboard/identities',
  '/dashboard/deliverability',
  '/dashboard/analytics',
]);

export default function HeaderBar() {
  const pathname = usePathname();
  const current = resolveNavItem(pathname);
  const quickActions = navigationItems.filter((item) => quickActionHrefs.has(item.href));

  return (
    <header className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,10,19,0.92))] px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:px-6 sm:py-6 lg:px-7 lg:py-7">
      <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-cyan-100">
              TMail 2
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
              {current.section}
            </span>
          </div>
          <h2 className="mt-4 font-display text-[2.15rem] leading-none text-white sm:text-5xl">{current.label}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300/74 sm:text-base">{current.description}</p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 xl:min-w-[380px]">
          {quickActions.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'rounded-[22px] border px-4 py-3 text-sm transition',
                  active
                    ? 'border-white/14 bg-white/10 text-white'
                    : 'border-white/10 bg-white/[0.04] text-slate-300/78 hover:bg-white/[0.07] hover:text-white',
                ].join(' ')}
              >
                <div className="font-medium">{item.label}</div>
                <div className="mt-1 text-xs leading-5 text-slate-400">{item.state === 'live' ? 'Working surface' : 'Staged route'}</div>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
