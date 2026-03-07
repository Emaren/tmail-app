'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/compose', label: 'Compose' },
  { href: '/dashboard/messages', label: 'Messages' },
  { href: '/dashboard/identities', label: 'Identities' },
  { href: '/dashboard/deliverability', label: 'Deliverability' },
  { href: '/dashboard/settings', label: 'Settings' },
];

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col justify-between rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.92),rgba(9,17,29,0.78))] p-5 shadow-[0_22px_90px_rgba(0,0,0,0.48)] backdrop-blur">
      <div className="space-y-8">
        <div className="space-y-3 px-2">
          <p className="text-[0.7rem] uppercase tracking-[0.42em] text-cyan-200/65">TMail</p>
          <div>
            <h1 className="font-display text-3xl leading-none text-white">Operator Castle</h1>
            <p className="mt-3 max-w-[16rem] text-sm leading-6 text-slate-300/70">
              Compose in TMail. Validate in TMail. Send through trusted rails.
            </p>
          </div>
        </div>

        <nav className="space-y-2">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'group flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition',
                  active
                    ? 'bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                    : 'text-slate-300/72 hover:bg-white/6 hover:text-white',
                ].join(' ')}
              >
                <span>{item.label}</span>
                <span className="text-xs uppercase tracking-[0.26em] text-cyan-200/55 group-hover:text-cyan-200/85">
                  {active ? 'Live' : 'Go'}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="rounded-3xl border border-amber-300/14 bg-amber-300/6 p-4 text-sm text-slate-200/78">
        <p className="text-[0.68rem] uppercase tracking-[0.3em] text-amber-100/65">Build Mode</p>
        <p className="mt-2 leading-6">
          Apple SMTP first. Seed inbox lab and campaign engine next.
        </p>
      </div>
    </aside>
  );
}
