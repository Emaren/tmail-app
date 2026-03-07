import { ReactNode } from 'react';

interface PanelProps {
  title?: string;
  kicker?: string;
  children: ReactNode;
  className?: string;
}

export default function Panel({ title, kicker, children, className = '' }: PanelProps) {
  return (
    <section
      className={[
        'rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(8,10,19,0.9))] p-5 shadow-[0_20px_80px_rgba(0,0,0,0.35)] backdrop-blur sm:p-6 lg:p-7',
        className,
      ].join(' ')}
    >
      {(title || kicker) && (
        <header className="mb-6 space-y-2">
          {kicker ? <p className="text-[0.68rem] uppercase tracking-[0.32em] text-cyan-200/65">{kicker}</p> : null}
          {title ? <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2> : null}
        </header>
      )}
      {children}
    </section>
  );
}
