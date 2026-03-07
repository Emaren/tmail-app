import { redirect } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import { getSession, isAuthConfigured } from '@/lib/auth';

export default async function LoginPage() {
  const session = await getSession();
  if (session) {
    redirect('/dashboard');
  }

  const configured = isAuthConfigured();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1280px] items-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_0.85fr]">
        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,11,24,0.97),rgba(8,14,24,0.92))] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.4)] backdrop-blur sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/30 to-transparent" />
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border border-cyan-300/22 bg-cyan-300/10 text-cyan-100 shadow-[0_16px_40px_rgba(6,182,212,0.16)]">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M4 8l8-4 8 4-8 4-8-4z" />
              <path d="M4 12l8 4 8-4" />
              <path d="M4 16l8 4 8-4" />
            </svg>
          </div>
          <p className="mt-6 text-[0.68rem] uppercase tracking-[0.34em] text-cyan-200/68">Private operator surface</p>
          <h1 className="mt-3 font-display text-[clamp(3rem,8vw,5.6rem)] leading-[0.92] text-white">TMail</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300/78">
            The public dashboard phase is over. This surface is now locked to the operator session and the backend is no longer meant to be called directly from the browser.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Sending</p>
              <div className="mt-3 text-lg font-semibold text-white">Apple SMTP live</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Tracking</p>
              <div className="mt-3 text-lg font-semibold text-white">Public event rails</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5">
              <p className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Build</p>
              <div className="mt-3 text-lg font-semibold text-white">Seed lab + templates</div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden rounded-[34px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(8,10,19,0.95))] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.36)] backdrop-blur sm:p-10">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
          <p className="text-[0.68rem] uppercase tracking-[0.34em] text-slate-400">Admin auth</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Enter the castle</h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300/74">
            Use the configured TMail admin credentials to unlock the dashboard, proxy layer, identities, seed lab, and template surfaces.
          </p>

          {configured ? (
            <div className="mt-8">
              <LoginForm />
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-amber-300/20 bg-amber-300/10 p-5 text-sm leading-7 text-amber-100">
              TMail admin auth is not configured yet. Set the admin session environment values before using the protected dashboard.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
