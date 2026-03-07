'use client';

import RouteIcon from '@/components/layout/RouteIcon';
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
    <header className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(8,10,19,0.95))] px-5 py-6 shadow-[0_20px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:px-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
      <div className="pointer-events-none absolute -top-16 right-[-10%] h-48 w-48 rounded-full bg-cyan-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-4rem] left-[-3rem] h-36 w-36 rounded-full bg-amber-300/8 blur-3xl" />

      <div className="relative grid gap-6 2xl:grid-cols-[minmax(0,1fr)_400px] 2xl:items-end">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="rounded-full border border-cyan-300/18 bg-cyan-300/10 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-cyan-100">
              TMail 2
            </span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-slate-200">
              {current.section}
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[0.62rem] uppercase tracking-[0.28em] text-slate-300/82">
              {current.state === 'live' ? 'Live Surface' : 'Staged Surface'}
            </span>
          </div>

          <div className="mt-6 flex items-start gap-4 sm:gap-5">
            <RouteIcon name={current.icon} active size="md" />
            <div className="min-w-0">
              <h2 className="font-display text-[clamp(2.4rem,5vw,4.8rem)] leading-[0.92] text-white">{current.label}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300/74 sm:text-base">
                {current.description}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 2xl:grid-cols-1">
          {liveSignals.map((signal) => (
            <div
              key={signal.label}
              className="rounded-[24px] border border-white/8 bg-white/[0.035] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
            >
              <p className="text-[0.58rem] uppercase tracking-[0.28em] text-slate-400">{signal.label}</p>
              <div className="mt-3 text-base font-semibold text-white">{signal.value}</div>
              <p className="mt-2 text-sm leading-6 text-slate-300/72">{signal.note}</p>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
