export default function HeaderBar() {
  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 px-6 py-5 backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/65">TMail 2</p>
        <h2 className="mt-2 font-display text-4xl leading-none text-white">Premium outbound command center</h2>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-slate-300/75">
        <div className="rounded-full border border-emerald-300/18 bg-emerald-300/8 px-4 py-2">
          Local-first build track
        </div>
        <div className="rounded-full border border-cyan-300/18 bg-cyan-300/8 px-4 py-2">
          VPS deploy by checkpoint
        </div>
      </div>
    </header>
  );
}
