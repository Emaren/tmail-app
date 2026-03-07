'use client';

import { usePathname } from 'next/navigation';
import { resolveNavItem } from '@/lib/navigation';

const liveSignals = [
  {
    label: 'Sending rail',
    value: 'Apple SMTP live',
    note: 'Founder and brand identities are authenticated through Apple.',
  },
  {
    label: 'Tracking base',
    value: 'Public endpoint live',
    note: 'Open and click events resolve through api.tmail.tokentap.ca.',
  },
  {
    label: 'Deployment',
    value: 'VPS checkpoint',
    note: 'Dashboard and API are running on the current production server.',
  },
];

export default function HeaderBar() {
  const pathname = usePathname();
  const current = resolveNavItem(pathname);

  return (
    <header className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,10,19,0.92))] px-5 py-5 shadow-[0_20px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:px-6 sm:py-6 lg:px-7 lg:py-7">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] xl:items-end">
        <div className="max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-cyan-100">
              TMail 2
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
              {current.section}
            </span>
          </div>

          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,4rem)] leading-[0.92] text-white">{current.label}</h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300/74 sm:text-base">{current.description}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
          {liveSignals.map((signal) => (
            <div key={signal.label} className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <p className="text-[0.62rem] uppercase tracking-[0.26em] text-slate-400">{signal.label}</p>
              <div className="mt-3 text-base font-semibold text-white">{signal.value}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300/72">{signal.note}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
