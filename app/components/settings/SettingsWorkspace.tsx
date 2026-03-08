'use client';

import { useMemo, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { OperatorSummary } from '@/lib/types';

interface SessionSummary {
  id: string;
  username: string;
  displayName: string;
  role: string;
}

interface SettingsWorkspaceProps {
  session: SessionSummary;
  operators: OperatorSummary[];
  apiBase: string;
}

interface OperatorApiPayload {
  id: string;
  username?: string;
  display_name?: string;
  role?: string;
  is_active?: boolean;
  totp_enabled?: boolean;
  totp_pending?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'Never';
  }
  return new Date(value).toLocaleString();
}

function normalizeOperator(payload: OperatorApiPayload): OperatorSummary {
  return {
    id: payload.id,
    username: payload.username ?? 'operator',
    displayName: payload.display_name ?? payload.username ?? 'Operator',
    role: payload.role ?? 'admin',
    isActive: payload.is_active ?? true,
    totpEnabled: payload.totp_enabled ?? false,
    totpPending: payload.totp_pending ?? false,
    lastLoginAt: payload.last_login_at ?? null,
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  };
}

export default function SettingsWorkspace({ session, operators, apiBase }: SettingsWorkspaceProps) {
  const [operatorList, setOperatorList] = useState(operators);
  const [feedback, setFeedback] = useState<{ tone: 'healthy' | 'attention' | 'critical'; body: string } | null>(null);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', totpCode: '' });
  const [pendingTotp, setPendingTotp] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [disableForm, setDisableForm] = useState({ password: '', totpCode: '' });
  const [createForm, setCreateForm] = useState({ username: '', displayName: '', password: '', role: 'admin' });
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const currentOperator = useMemo(
    () => operatorList.find((item) => item.id === session.id) ?? operatorList.find((item) => item.username === session.username),
    [operatorList, session.id, session.username],
  );

  async function runAction(actionKey: string, request: () => Promise<void>) {
    setPendingAction(actionKey);
    setFeedback(null);
    try {
      await request();
    } catch (error) {
      setFeedback({
        tone: 'critical',
        body: error instanceof Error ? error.message : 'Request failed.',
      });
    } finally {
      setPendingAction(null);
    }
  }

  async function createOperator() {
    await runAction('create-operator', async () => {
      const response = await fetch(`${apiBase}/auth/operators`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: createForm.username,
          display_name: createForm.displayName,
          password: createForm.password,
          role: createForm.role,
        }),
      });
      const payload = (await response.json()) as { error?: string } & OperatorApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Operator creation failed.');
      }
      const operator = normalizeOperator(payload);
      setOperatorList((current) => [operator, ...current.filter((item) => item.id !== operator.id)]);
      setCreateForm({ username: '', displayName: '', password: '', role: 'admin' });
      setFeedback({ tone: 'healthy', body: `Operator ${operator.username} created.` });
    });
  }

  async function rotatePassword() {
    if (!currentOperator) {
      return;
    }
    await runAction('rotate-password', async () => {
      const response = await fetch(`${apiBase}/auth/operators/${currentOperator.id}/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword,
          totp_code: passwordForm.totpCode,
        }),
      });
      const payload = (await response.json()) as { error?: string } & OperatorApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Password update failed.');
      }
      const operator = normalizeOperator(payload);
      setOperatorList((current) => current.map((item) => (item.id === operator.id ? operator : item)));
      setPasswordForm({ currentPassword: '', newPassword: '', totpCode: '' });
      setFeedback({ tone: 'healthy', body: 'Password updated.' });
    });
  }

  async function beginTotpSetup() {
    if (!currentOperator) {
      return;
    }
    await runAction('start-totp', async () => {
      const response = await fetch(`${apiBase}/auth/operators/${currentOperator.id}/totp/setup`, {
        method: 'POST',
      });
      const payload = (await response.json()) as { error?: string; secret?: string; otpauth_uri?: string };
      if (!response.ok || !payload.secret || !payload.otpauth_uri) {
        throw new Error(payload.error ?? 'TOTP setup failed.');
      }
      setPendingTotp({ secret: payload.secret, otpauthUri: payload.otpauth_uri });
      setFeedback({ tone: 'healthy', body: 'TOTP secret generated. Add it to your authenticator and confirm with a 6-digit code.' });
    });
  }

  async function confirmTotp() {
    if (!currentOperator) {
      return;
    }
    await runAction('confirm-totp', async () => {
      const response = await fetch(`${apiBase}/auth/operators/${currentOperator.id}/totp/enable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: totpCode }),
      });
      const payload = (await response.json()) as { error?: string } & OperatorApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'TOTP confirmation failed.');
      }
      const operator = normalizeOperator(payload);
      setOperatorList((current) => current.map((item) => (item.id === operator.id ? operator : item)));
      setPendingTotp(null);
      setTotpCode('');
      setFeedback({ tone: 'healthy', body: 'TOTP is now enabled for this operator.' });
    });
  }

  async function disableTotp() {
    if (!currentOperator) {
      return;
    }
    await runAction('disable-totp', async () => {
      const response = await fetch(`${apiBase}/auth/operators/${currentOperator.id}/totp/disable`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: disableForm.password, totp_code: disableForm.totpCode }),
      });
      const payload = (await response.json()) as { error?: string } & OperatorApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'TOTP disable failed.');
      }
      const operator = normalizeOperator(payload);
      setOperatorList((current) => current.map((item) => (item.id === operator.id ? operator : item)));
      setDisableForm({ password: '', totpCode: '' });
      setFeedback({ tone: 'attention', body: 'TOTP has been disabled for this operator.' });
    });
  }

  return (
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Panel title="Operator security" kicker="Live auth surface">
          <div className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Current operator</div>
                  <h3 className="mt-2 text-xl font-semibold text-white">{currentOperator?.displayName ?? session.displayName}</h3>
                </div>
                <StatusPill label={currentOperator?.totpEnabled ? '2FA live' : 'Password only'} state={currentOperator?.totpEnabled ? 'healthy' : 'attention'} />
              </div>
              <div className="mt-5 space-y-2 text-sm leading-6 text-slate-300/74">
                <div>Username: <span className="text-white">{session.username}</span></div>
                <div>Role: <span className="text-white">{session.role}</span></div>
                <div>Last login: <span className="text-white">{formatDate(currentOperator?.lastLoginAt)}</span></div>
              </div>
            </article>

            <article className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <div className="text-[0.62rem] uppercase tracking-[0.28em] text-slate-400">Security posture</div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-300/74">
                <p>Operator accounts now live in the API database instead of the Next app env alone.</p>
                <p>Sessions are still signed by the app, but credentials and TOTP state now live behind the internal API token.</p>
                <p>Use TOTP before you start adding more operators or exposing more campaign capability.</p>
              </div>
            </article>
          </div>

          {feedback ? (
            <div className={[
              'mt-5 rounded-[22px] border px-4 py-4 text-sm',
              feedback.tone === 'healthy' ? 'border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-50' : feedback.tone === 'attention' ? 'border-amber-300/18 bg-amber-300/[0.07] text-amber-50' : 'border-rose-300/20 bg-rose-300/[0.08] text-rose-50',
            ].join(' ')}>
              {feedback.body}
            </div>
          ) : null}
        </Panel>

        <Panel title="Password rotation" kicker="Current operator only">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Current password</span>
              <input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">New password</span>
              <input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78 md:col-span-2">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">TOTP code</span>
              <input inputMode="numeric" value={passwordForm.totpCode} onChange={(event) => setPasswordForm((current) => ({ ...current, totpCode: event.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder={currentOperator?.totpEnabled ? 'Required when 2FA is enabled' : 'Optional until TOTP is enabled'} />
            </label>
          </div>
          <button onClick={rotatePassword} disabled={pendingAction !== null} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
            {pendingAction === 'rotate-password' ? 'Updating password...' : 'Update password'}
          </button>
        </Panel>

        <Panel title="TOTP / 2FA" kicker="Authenticator-backed operator login">
          <div className="space-y-5 text-sm leading-6 text-slate-300/74">
            {!currentOperator?.totpEnabled ? (
              <>
                <p>Generate a setup secret, add it to your authenticator app, then confirm with a 6-digit code.</p>
                <button onClick={beginTotpSetup} disabled={pendingAction !== null} className="rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
                  {pendingAction === 'start-totp' ? 'Generating secret...' : pendingTotp ? 'Regenerate setup secret' : 'Generate setup secret'}
                </button>
                {pendingTotp ? (
                  <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                    <div className="space-y-3">
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Manual setup key</div>
                        <div className="mt-2 break-all rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm text-white">{pendingTotp.secret}</div>
                      </div>
                      <div>
                        <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">OTPAuth URI</div>
                        <div className="mt-2 break-all rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-slate-300">{pendingTotp.otpauthUri}</div>
                      </div>
                      <label className="space-y-2 text-sm text-slate-300/78">
                        <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Confirm TOTP code</span>
                        <input inputMode="numeric" value={totpCode} onChange={(event) => setTotpCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                      </label>
                      <button onClick={confirmTotp} disabled={pendingAction !== null} className="rounded-[20px] border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60">
                        {pendingAction === 'confirm-totp' ? 'Confirming...' : 'Enable TOTP'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1fr_0.92fr]">
                <div className="rounded-[24px] border border-cyan-300/14 bg-cyan-300/[0.06] p-5">
                  <div className="flex items-center gap-3">
                    <StatusPill label="2FA live" state="healthy" />
                    <span className="text-sm text-slate-200">TOTP is required on future login attempts for this operator.</span>
                  </div>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 space-y-4">
                  <label className="space-y-2 text-sm text-slate-300/78">
                    <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Current password</span>
                    <input type="password" value={disableForm.password} onChange={(event) => setDisableForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                  </label>
                  <label className="space-y-2 text-sm text-slate-300/78">
                    <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Current TOTP code</span>
                    <input inputMode="numeric" value={disableForm.totpCode} onChange={(event) => setDisableForm((current) => ({ ...current, totpCode: event.target.value.replace(/[^0-9]/g, '').slice(0, 6) }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
                  </label>
                  <button onClick={disableTotp} disabled={pendingAction !== null} className="rounded-[20px] border border-amber-300/18 bg-amber-300/[0.08] px-5 py-3 text-sm font-medium text-amber-50 transition hover:bg-amber-300/[0.12] disabled:cursor-not-allowed disabled:opacity-60">
                    {pendingAction === 'disable-totp' ? 'Disabling...' : 'Disable TOTP'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Operator roster" kicker="API-backed accounts">
          <div className="space-y-4">
            {operatorList.map((operator) => (
              <article key={operator.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{operator.displayName}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{operator.username}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill label={operator.role} state={operator.role === 'owner' ? 'healthy' : 'neutral'} />
                    <StatusPill label={operator.totpEnabled ? '2FA live' : operator.totpPending ? '2FA pending' : 'Password only'} state={operator.totpEnabled ? 'healthy' : operator.totpPending ? 'attention' : 'neutral'} />
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-2">
                  <div>
                    <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Last login</div>
                    <div className="mt-2 text-white">{formatDate(operator.lastLoginAt)}</div>
                  </div>
                  <div>
                    <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Updated</div>
                    <div className="mt-2 text-white">{formatDate(operator.updatedAt)}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        {session.role === 'owner' ? (
          <Panel title="Create operator" kicker="Owner-only control">
            <div className="grid gap-4">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Username</span>
                <input value={createForm.username} onChange={(event) => setCreateForm((current) => ({ ...current, username: event.target.value.toLowerCase().trimStart() }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Display name</span>
                <input value={createForm.displayName} onChange={(event) => setCreateForm((current) => ({ ...current, displayName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Password</span>
                <input type="password" value={createForm.password} onChange={(event) => setCreateForm((current) => ({ ...current, password: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Role</span>
                <select value={createForm.role} onChange={(event) => setCreateForm((current) => ({ ...current, role: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
              </label>
            </div>
            <button onClick={createOperator} disabled={pendingAction !== null} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
              {pendingAction === 'create-operator' ? 'Creating operator...' : 'Create operator'}
            </button>
          </Panel>
        ) : null}
      </div>
    </div>
  );
}
