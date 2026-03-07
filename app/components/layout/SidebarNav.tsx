'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { navigationItems, navigationSections, resolveNavItem } from '@/lib/navigation';

function NavButton({
  href,
  label,
  state,
  active,
}: {
  href: string;
  label: string;
  state: 'live' | 'staged';
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition',
        active
          ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
          : 'text-slate-300/76 hover:bg-white/6 hover:text-white',
      ].join(' ')}
    >
      <span>{label}</span>
      <span
        className={[
          'rounded-full border px-2 py-1 text-[0.62rem] uppercase tracking-[0.24em] transition',
          state === 'live'
            ? 'border-cyan-300/18 bg-cyan-300/10 text-cyan-100'
            : 'border-white/10 bg-white/6 text-slate-300',
        ].join(' ')}
      >
        {active ? 'Here' : state === 'live' ? 'Live' : 'Staged'}
      </span>
    </Link>
  );
}

export default function SidebarNav() {
  const pathname = usePathname();
  const current = resolveNavItem(pathname);

  return (
    <>
      <div className="lg:hidden">
        <div className="sticky top-3 z-40 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.94),rgba(8,14,24,0.9))] p-4 shadow-[0_22px_90px_rgba(0,0,0,0.44)] backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.38em] text-cyan-200/65">TMail</p>
              <h1 className="mt-2 font-display text-2xl leading-none text-white">Operator Castle</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300/74">{current.label}</p>
            </div>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1.5 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
              All Sections
            </span>
          </div>

          <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
            {navigationItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'whitespace-nowrap rounded-full border px-4 py-2 text-sm transition',
                    active
                      ? 'border-cyan-300/24 bg-cyan-300/12 text-white'
                      : 'border-white/10 bg-white/[0.04] text-slate-300/76 hover:bg-white/[0.07] hover:text-white',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <aside className="hidden h-fit flex-col justify-between rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.95),rgba(8,14,24,0.88))] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.48)] backdrop-blur lg:sticky lg:top-6 lg:flex lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto">
        <div className="space-y-8">
          <div className="space-y-3 px-2">
            <p className="text-[0.68rem] uppercase tracking-[0.42em] text-cyan-200/65">TMail</p>
            <div>
              <h1 className="font-display text-3xl leading-none text-white">Operator Castle</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300/70">
                Compose in TMail. Validate in TMail. Send through trusted rails.
              </p>
            </div>
          </div>

          <div className="rounded-[26px] border border-white/8 bg-white/[0.03] px-4 py-4">
            <p className="text-[0.64rem] uppercase tracking-[0.26em] text-slate-400">Current room</p>
            <div className="mt-3 text-lg font-semibold text-white">{current.label}</div>
            <p className="mt-2 text-sm leading-6 text-slate-300/70">{current.description}</p>
          </div>

          <nav className="space-y-5">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <p className="px-2 text-[0.66rem] uppercase tracking-[0.34em] text-slate-400">{section.title}</p>
                <div className="space-y-2">
                  {section.items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return <NavButton key={item.href} href={item.href} label={item.label} state={item.state} active={active} />;
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-8 rounded-[26px] border border-amber-300/14 bg-amber-300/6 p-5 text-sm text-slate-200/78">
          <p className="text-[0.68rem] uppercase tracking-[0.3em] text-amber-100/65">Build Mode</p>
          <p className="mt-3 leading-6">
            Apple SMTP is live. Seed inbox lab, campaigns, contacts, and analytics are now routed and ready for deeper wiring.
          </p>
        </div>
      </aside>
    </>
  );
}
