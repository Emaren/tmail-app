'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems, navigationSections, resolveNavItem } from '@/lib/navigation';

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function routeStateLabel(active: boolean, state: 'live' | 'staged') {
  if (active) {
    return 'Current';
  }
  return state === 'live' ? 'Ready' : 'Staged';
}

export default function SidebarNav() {
  const pathname = usePathname();
  const current = resolveNavItem(pathname);

  return (
    <>
      <div className="xl:hidden">
        <div className="sticky top-3 z-40 rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.96),rgba(8,14,24,0.92))] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.44)] backdrop-blur sm:p-5">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.34em] text-cyan-200/70">TMail</p>
                <h1 className="mt-2 font-display text-[2rem] leading-none text-white sm:text-[2.3rem]">Operator Castle</h1>
                <p className="mt-3 text-sm leading-6 text-slate-300/74">{current.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
                {current.label}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded-[22px] border px-4 py-4 transition',
                      active
                        ? 'border-cyan-300/20 bg-cyan-300/10 text-white'
                        : 'border-white/10 bg-white/[0.03] text-slate-300/78 hover:bg-white/[0.06] hover:text-white',
                    ].join(' ')}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">{item.section}</p>
                        <h3 className="mt-2 text-base font-semibold text-white">{item.label}</h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-slate-200">
                        {routeStateLabel(active, item.state)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="hidden h-fit flex-col justify-between rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.96),rgba(8,14,24,0.9))] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.48)] backdrop-blur xl:sticky xl:top-6 xl:flex xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
        <div className="space-y-8">
          <div className="space-y-3 px-2">
            <p className="text-[0.68rem] uppercase tracking-[0.4em] text-cyan-200/68">TMail</p>
            <div>
              <h1 className="font-display text-[2.5rem] leading-none text-white">Operator Castle</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300/70">
                Compose in TMail. Validate in TMail. Send through trusted rails.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Current room</p>
            <h2 className="mt-3 text-lg font-semibold text-white">{current.label}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300/72">{current.description}</p>
          </div>

          <nav className="space-y-5">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <p className="px-2 text-[0.62rem] uppercase tracking-[0.32em] text-slate-400">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          'block rounded-[22px] border px-4 py-3 transition',
                          active
                            ? 'border-white/12 bg-white/[0.09] text-white'
                            : 'border-white/10 bg-white/[0.03] text-slate-300/76 hover:bg-white/[0.06] hover:text-white',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-medium">{item.label}</div>
                            <div className="mt-1 text-xs leading-5 text-slate-400">{item.description}</div>
                          </div>
                          <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-slate-200">
                            {routeStateLabel(active, item.state)}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-8 rounded-[24px] border border-amber-300/14 bg-amber-300/6 p-5 text-sm text-slate-200/78">
          <p className="text-[0.66rem] uppercase tracking-[0.28em] text-amber-100/68">Build Mode</p>
          <p className="mt-3 leading-6">
            The shell is live, the routes are real, and the next work is auth, seed testing, and analytics depth.
          </p>
        </div>
      </aside>
    </>
  );
}
