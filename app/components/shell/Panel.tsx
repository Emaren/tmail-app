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
        'relative overflow-hidden rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(8,10,19,0.94))] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.34)] backdrop-blur sm:p-6 lg:p-7',
        className,
      ].join(' ')}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
      <div className="pointer-events-none absolute right-[-2rem] top-[-2rem] h-24 w-24 rounded-full bg-cyan-300/8 blur-3xl" />
      <div className="relative">
        {(title || kicker) && (
          <header className="mb-6 space-y-2.5">
            {kicker ? <p className="text-[0.64rem] uppercase tracking-[0.34em] text-cyan-200/65">{kicker}</p> : null}
            {title ? <h2 className="text-xl font-semibold leading-tight text-white sm:text-[1.65rem]">{title}</h2> : null}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
