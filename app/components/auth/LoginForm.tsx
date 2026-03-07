'use client';

import { FormEvent, useState } from 'react';

export default function LoginForm() {
  const [username, setUsername] = useState('tony');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Login failed.');
      }
      window.location.href = '/dashboard';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block space-y-2 text-sm text-slate-300/78">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-slate-400">Username</span>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        />
      </label>

      <label className="block space-y-2 text-sm text-slate-300/78">
        <span className="text-[0.68rem] uppercase tracking-[0.3em] text-slate-400">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-[20px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
        />
      </label>

      {error ? <div className="rounded-[18px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-[20px] border border-cyan-300/24 bg-cyan-300/12 px-4 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? 'Opening dashboard...' : 'Enter TMail'}
      </button>
    </form>
  );
}
