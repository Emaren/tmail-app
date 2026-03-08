interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  tone?: 'default' | 'cyan' | 'amber';
  valueClassName?: string;
  valueTitle?: string;
}

const toneClasses = {
  default: 'from-white/12 via-white/[0.07] to-white/[0.03] border-white/10',
  cyan: 'from-cyan-300/18 via-cyan-300/[0.08] to-white/[0.03] border-cyan-300/20',
  amber: 'from-amber-300/18 via-amber-300/[0.08] to-white/[0.03] border-amber-300/20',
};

export default function StatCard({ title, value, subtext, tone = 'default', valueClassName, valueTitle }: StatCardProps) {
  return (
    <article
      className={[
        'relative min-h-[198px] overflow-hidden rounded-[28px] border bg-gradient-to-br p-5 shadow-[0_20px_70px_rgba(0,0,0,0.28)] sm:p-6',
        toneClasses[tone],
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="pointer-events-none absolute right-[-1.5rem] top-[-1.5rem] h-20 w-20 rounded-full bg-white/8 blur-3xl" />

      <div className="relative flex h-full flex-col justify-between gap-6">
        <div>
          <p className="text-[0.62rem] uppercase tracking-[0.32em] text-slate-300/65">{title}</p>
          <div
            title={valueTitle ?? value}
            className={[
              'mt-5 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[2.4rem] font-semibold leading-none text-white sm:text-[2.85rem]',
              valueClassName ?? '',
            ].join(' ')}
          >
            {value}
          </div>
        </div>
        {subtext ? <p className="max-w-[22rem] text-sm leading-6 text-slate-300/74">{subtext}</p> : null}
      </div>
    </article>
  );
}
