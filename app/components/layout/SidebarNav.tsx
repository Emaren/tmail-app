'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RouteIcon from '@/components/layout/RouteIcon';
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

function BrandMark() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-cyan-300/22 bg-cyan-300/10 text-cyan-100 shadow-[0_16px_40px_rgba(6,182,212,0.16)]">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M4 8l8-4 8 4-8 4-8-4z" />
        <path d="M4 12l8 4 8-4" />
        <path d="M4 16l8 4 8-4" />
      </svg>
    </div>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();
  const current = resolveNavItem(pathname);

  return (
    <>
      <div className="xl:hidden">
        <div className="sticky top-3 z-40 overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.97),rgba(8,14,24,0.94))] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.44)] backdrop-blur sm:p-5">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
          <div className="relative flex flex-col gap-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <BrandMark />
                  <div>
                    <p className="text-[0.62rem] uppercase tracking-[0.34em] text-cyan-200/70">TMail</p>
                    <h1 className="mt-1 font-display text-[2rem] leading-none text-white sm:text-[2.3rem]">Operator Castle</h1>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl line-clamp-2 text-sm leading-6 text-slate-300/74">{current.description}</p>
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
                {routeStateLabel(true, current.state)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {navigationItems.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded-[24px] border px-4 py-4 transition',
                      active
                        ? 'border-cyan-300/24 bg-cyan-300/10 text-white shadow-[0_18px_50px_rgba(6,182,212,0.14)]'
                        : 'border-white/10 bg-white/[0.03] text-slate-300/78 hover:border-white/14 hover:bg-white/[0.06] hover:text-white',
                    ].join(' ')}
                  >
                    <div className="flex h-full flex-col gap-4">
                      <div className="flex items-start justify-between gap-3">
                        <RouteIcon name={item.icon} active={active} size="sm" />
                        <span className="rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-slate-200">
                          {routeStateLabel(active, item.state)}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[0.56rem] uppercase tracking-[0.28em] text-slate-400">{item.section}</p>
                        <h3 className="mt-2 text-base font-semibold text-white">{item.label}</h3>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <aside className="relative hidden h-fit flex-col justify-between overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.97),rgba(8,14,24,0.92))] p-6 shadow-[0_22px_90px_rgba(0,0,0,0.48)] backdrop-blur xl:sticky xl:top-6 xl:flex xl:max-h-[calc(100vh-3rem)] xl:overflow-y-auto">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />

        <div className="relative space-y-8">
          <div className="space-y-4 px-1">
            <div className="flex items-center gap-3">
              <BrandMark />
              <div>
                <p className="text-[0.68rem] uppercase tracking-[0.38em] text-cyan-200/68">TMail</p>
                <h1 className="mt-1 font-display text-[2.45rem] leading-none text-white">Operator Castle</h1>
              </div>
            </div>
            <p className="max-w-xs text-sm leading-6 text-slate-300/70">
              Compose in TMail. Validate in TMail. Send through trusted rails.
            </p>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/[0.035] p-5">
            <div className="flex items-center gap-3">
              <RouteIcon name={current.icon} active size="md" />
              <div className="min-w-0">
                <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Current room</p>
                <h2 className="mt-1 text-lg font-semibold text-white">{current.label}</h2>
              </div>
            </div>
            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300/72">{current.description}</p>
          </div>

          <nav className="space-y-5">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2.5">
                <p className="px-1 text-[0.62rem] uppercase tracking-[0.32em] text-slate-400">{section.title}</p>
                <div className="space-y-2.5">
                  {section.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          'group block rounded-[24px] border px-4 py-4 transition',
                          active
                            ? 'border-cyan-300/22 bg-cyan-300/[0.09] text-white shadow-[0_18px_60px_rgba(6,182,212,0.12)]'
                            : 'border-white/10 bg-white/[0.03] text-slate-300/76 hover:border-white/14 hover:bg-white/[0.055] hover:text-white',
                        ].join(' ')}
                      >
                        <div className="flex items-start gap-3">
                          <RouteIcon name={item.icon} active={active} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-medium text-white">{item.label}</div>
                                <div className="mt-1 line-clamp-2 text-[0.78rem] leading-5 text-slate-400">{item.description}</div>
                              </div>
                              <span className="shrink-0 rounded-full border border-white/10 bg-white/6 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.24em] text-slate-200">
                                {routeStateLabel(active, item.state)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="relative mt-8 rounded-[26px] border border-amber-300/14 bg-[linear-gradient(180deg,rgba(252,211,77,0.07),rgba(8,14,24,0.35))] p-5 text-sm text-slate-200/78">
          <p className="text-[0.66rem] uppercase tracking-[0.28em] text-amber-100/68">Build Mode</p>
          <p className="mt-3 leading-6">
            Auth, seed testing, and analytics depth are the next structural pieces. The shell is now stable enough to refine without repainting it every checkpoint.
          </p>
        </div>
      </aside>
    </>
  );
}
