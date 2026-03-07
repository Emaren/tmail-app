import { HealthState } from '@/lib/types';

export default function StatusPill({ label, state = 'healthy' }: { label: string; state?: HealthState | 'neutral' }) {
  const tone =
    state === 'healthy'
      ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'
      : state === 'attention'
        ? 'border-amber-300/20 bg-amber-300/10 text-amber-100'
        : state === 'critical'
          ? 'border-rose-300/20 bg-rose-300/10 text-rose-100'
          : 'border-white/10 bg-white/6 text-slate-200';

  return <span className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.24em] ${tone}`}>{label}</span>;
}
