interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
  tone?: 'default' | 'cyan' | 'amber';
}

const toneClasses = {
  default: 'from-white/12 to-white/5',
  cyan: 'from-cyan-300/18 to-cyan-300/5',
  amber: 'from-amber-300/18 to-amber-300/5',
};

export default function StatCard({ title, value, subtext, tone = 'default' }: StatCardProps) {
  return (
    <article
      className={[
        'rounded-[26px] border border-white/10 bg-gradient-to-br p-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)]',
        toneClasses[tone],
      ].join(' ')}
    >
      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-slate-300/65">{title}</p>
      <div className="mt-4 text-4xl font-semibold text-white">{value}</div>
      {subtext ? <p className="mt-3 text-sm leading-6 text-slate-300/70">{subtext}</p> : null}
    </article>
  );
}
