import { ReactNode } from 'react';
import { NavIconName } from '@/lib/navigation';

const iconPaths: Record<NavIconName, ReactNode> = {
  overview: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  compose: (
    <>
      <path d="M4 20l4.5-1 10-10a2.12 2.12 0 10-3-3l-10 10L4 20z" />
      <path d="M13.5 6.5l4 4" />
    </>
  ),
  messages: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M7 9.5h10M7 13h10M7 16.5h7" />
    </>
  ),
  identities: (
    <>
      <circle cx="12" cy="8" r="3.25" />
      <path d="M5 19c1.6-3.1 4.1-4.7 7-4.7S17.4 15.9 19 19" />
    </>
  ),
  deliverability: (
    <>
      <path d="M12 3l7 3v5c0 5-2.8 8.2-7 10-4.2-1.8-7-5-7-10V6l7-3z" />
      <path d="M9 12.5l2 2 4-4.5" />
    </>
  ),
  'seed-tests': (
    <>
      <path d="M9 3h6" />
      <path d="M10 3v5l-4.5 7.8A3 3 0 008 20h8a3 3 0 002.5-4.2L14 8V3" />
      <path d="M9 13h6" />
    </>
  ),
  templates: (
    <>
      <rect x="4" y="4" width="12" height="14" rx="2" />
      <path d="M8 8h4M8 12h4" />
      <path d="M16 8h4v12H8v-2" />
    </>
  ),
  campaigns: (
    <>
      <path d="M4 14V7l10-3v16L4 17v-3z" />
      <path d="M14 8.5a4.5 4.5 0 010 7" />
      <path d="M16 6a7.5 7.5 0 010 12" />
    </>
  ),
  contacts: (
    <>
      <circle cx="9" cy="9" r="2.7" />
      <circle cx="16.5" cy="10.5" r="2.2" />
      <path d="M4.5 18c1.2-2.5 3.1-3.8 5.6-3.8 2.4 0 4.2 1.2 5.4 3.8" />
      <path d="M14.5 18c.8-1.7 2.1-2.6 4-2.6" />
    </>
  ),
  analytics: (
    <>
      <path d="M5 19V9" />
      <path d="M11 19V5" />
      <path d="M17 19v-7" />
      <path d="M3 19h18" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h4" />
      <path d="M12 17h8" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
};

interface RouteIconProps {
  name: NavIconName;
  active?: boolean;
  size?: 'sm' | 'md';
}

export default function RouteIcon({ name, active = false, size = 'md' }: RouteIconProps) {
  const frame = size === 'sm' ? 'h-9 w-9 rounded-[14px]' : 'h-11 w-11 rounded-[18px]';
  const tone = active
    ? 'border-cyan-300/28 bg-cyan-300/12 text-cyan-100 shadow-[0_12px_40px_rgba(6,182,212,0.18)]'
    : 'border-white/10 bg-white/[0.035] text-slate-300/86';

  return (
    <div className={`flex ${frame} items-center justify-center border ${tone}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={size === 'sm' ? 'h-[18px] w-[18px]' : 'h-5 w-5'}
        aria-hidden="true"
      >
        {iconPaths[name]}
      </svg>
    </div>
  );
}
