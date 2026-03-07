'use client';

import { useMemo, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { HealthState, IdentitySummary } from '@/lib/types';

interface IdentityManagerProps {
  identities: IdentitySummary[];
  apiBase: string;
}

interface IdentityFormState {
  id?: string;
  label: string;
  displayName: string;
  emailAddress: string;
  replyTo: string;
  smtpHost: string;
  smtpPort: string;
  smtpUsername: string;
  smtpSecretEnv: string;
  notes: string;
  trackingEnabled: boolean;
  pixelEnabled: boolean;
  useTls: boolean;
}

interface FeedbackState {
  tone: HealthState;
  title: string;
  body: string;
  identityId?: string;
}

function createBlankIdentity(): IdentityFormState {
  return {
    label: 'New rail',
    displayName: 'Sender Name',
    emailAddress: '',
    replyTo: '',
    smtpHost: 'smtp.mail.me.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpSecretEnv: '',
    notes: '',
    trackingEnabled: true,
    pixelEnabled: true,
    useTls: true,
  };
}

function hydrateForm(identity: IdentitySummary): IdentityFormState {
  return {
    id: identity.id,
    label: identity.label,
    displayName: identity.displayName ?? identity.label,
    emailAddress: identity.address,
    replyTo: identity.replyTo ?? identity.address,
    smtpHost: identity.smtpHost ?? 'smtp.mail.me.com',
    smtpPort: String(identity.smtpPort ?? 587),
    smtpUsername: identity.smtpUsername ?? identity.address,
    smtpSecretEnv: identity.smtpSecretEnv ?? '',
    notes: identity.notes ?? '',
    trackingEnabled: identity.tracking !== 'Tracking off',
    pixelEnabled: identity.tracking !== 'Links only',
    useTls: identity.useTls ?? true,
  };
}

function normalizeIdentityResponse(item: Record<string, unknown>): IdentitySummary {
  const providerType = typeof item.provider_type === 'string' ? item.provider_type : 'apple_smtp';
  const health = (item.health as { status?: HealthState; secretConfigured?: boolean } | undefined) ?? {};
  const secretConfigured = Boolean(health.secretConfigured);
  const emailAddress = typeof item.email_address === 'string' ? item.email_address : 'unknown@local';
  return {
    id: typeof item.id === 'string' ? item.id : 'identity-unknown',
    label: typeof item.label === 'string' ? item.label : 'Identity',
    address: emailAddress,
    provider: providerType === 'apple_smtp' ? 'Apple SMTP' : providerType,
    providerType,
    displayName: typeof item.display_name === 'string' ? item.display_name : undefined,
    replyTo: typeof item.reply_to === 'string' ? item.reply_to : emailAddress,
    smtpHost: typeof item.smtp_host === 'string' ? item.smtp_host : 'smtp.mail.me.com',
    smtpPort: typeof item.smtp_port === 'number' ? item.smtp_port : 587,
    smtpUsername: typeof item.smtp_username === 'string' ? item.smtp_username : emailAddress,
    smtpSecretEnv: typeof item.smtp_secret_env === 'string' ? item.smtp_secret_env : '',
    useTls: typeof item.use_tls === 'boolean' ? item.use_tls : true,
    health: health.status ?? 'attention',
    lastSend: secretConfigured ? 'Ready for connection test' : 'Credential env missing',
    clickRate: 'Pending',
    replyRate: 'Pending',
    tracking:
      item.tracking_enabled === false
        ? 'Tracking off'
        : item.pixel_enabled === false
          ? 'Links only'
          : 'Links + soft opens',
    notes: typeof item.notes === 'string' ? item.notes : '',
    secretConfigured,
  };
}

function upsertIdentity(items: IdentitySummary[], next: IdentitySummary): IdentitySummary[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [...items, next];
  }

  const updated = [...items];
  updated[existingIndex] = next;
  return updated;
}

export default function IdentityManager({ identities, apiBase }: IdentityManagerProps) {
  const [items, setItems] = useState(identities);
  const [selectedId, setSelectedId] = useState(identities[0]?.id ?? '');
  const [form, setForm] = useState<IdentityFormState>(identities[0] ? hydrateForm(identities[0]) : createBlankIdentity());
  const [pendingAction, setPendingAction] = useState<'save' | 'test' | null>(null);
  const [pendingIdentityId, setPendingIdentityId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectedIdentity = useMemo(
    () => items.find((item) => item.id === selectedId) ?? null,
    [items, selectedId],
  );

  function selectIdentity(identity: IdentitySummary) {
    setSelectedId(identity.id);
    setForm(hydrateForm(identity));
    setFeedback(null);
  }

  function resetForm() {
    setSelectedId('');
    setForm(createBlankIdentity());
    setFeedback(null);
  }

  function updateForm<K extends keyof IdentityFormState>(key: K, value: IdentityFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function saveIdentity() {
    if (!apiBase) {
      setFeedback({
        tone: 'attention',
        title: 'Admin proxy unavailable',
        body: 'The protected dashboard proxy is unavailable, so the sender rail could not be saved.',
      });
      return;
    }

    setPendingAction('save');
    setPendingIdentityId(form.id ?? null);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/identities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          label: form.label,
          display_name: form.displayName,
          email_address: form.emailAddress,
          provider_type: 'apple_smtp',
          smtp_host: form.smtpHost,
          smtp_port: Number(form.smtpPort),
          smtp_username: form.smtpUsername || form.emailAddress,
          smtp_secret_env: form.smtpSecretEnv,
          use_tls: form.useTls,
          reply_to: form.replyTo || form.emailAddress,
          tracking_enabled: form.trackingEnabled,
          pixel_enabled: form.pixelEnabled,
          notes: form.notes,
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to save identity.');
      }

      const normalized = normalizeIdentityResponse(payload);
      setItems((current) => upsertIdentity(current, normalized));
      setSelectedId(normalized.id);
      setForm(hydrateForm(normalized));
      setFeedback({
        tone: 'healthy',
        title: form.id ? 'Identity updated' : 'Identity created',
        body: `${normalized.address} is now available in the sender rail list.`,
        identityId: normalized.id,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Save failed',
        body: error instanceof Error ? error.message : 'Unknown identity save failure.',
      });
    } finally {
      setPendingAction(null);
      setPendingIdentityId(null);
    }
  }

  async function testConnection(identityId: string) {
    if (!apiBase) {
      setFeedback({
        tone: 'attention',
        title: 'Admin proxy unavailable',
        body: 'The protected dashboard proxy is unavailable, so the connection test could not run.',
      });
      return;
    }

    setPendingAction('test');
    setPendingIdentityId(identityId);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/identities/${identityId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const payload = (await response.json()) as { ok?: boolean; status?: string; detail?: string; error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Connection test failed.');
      }

      setFeedback({
        tone: payload.ok ? 'healthy' : 'attention',
        title: payload.ok ? 'Connection verified' : 'Connection needs attention',
        body: payload.detail ?? payload.status ?? 'No detail returned.',
        identityId,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Connection test failed',
        body: error instanceof Error ? error.message : 'Unknown connection failure.',
        identityId,
      });
    } finally {
      setPendingAction(null);
      setPendingIdentityId(null);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
      <Panel title="Sender identities" kicker="Trusted rails">
        <div className="space-y-4">
          {items.map((identity) => (
            <article key={identity.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-[0.68rem] uppercase tracking-[0.26em] text-cyan-200/65">{identity.label}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{identity.address}</h2>
                  <p className="mt-2 text-sm text-slate-300/72">{identity.provider}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill label={identity.health} state={identity.health} />
                  {selectedIdentity?.id === identity.id ? <StatusPill label="editing" state="neutral" /> : null}
                </div>
              </div>

              <div className="mt-6 grid gap-4 text-sm text-slate-300/72 sm:grid-cols-2">
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Credential state</div>
                  <div className="mt-2 text-white">{identity.lastSend}</div>
                </div>
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Tracking mode</div>
                  <div className="mt-2 text-white">{identity.tracking}</div>
                </div>
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Reply-To</div>
                  <div className="mt-2 text-white">{identity.replyTo ?? identity.address}</div>
                </div>
                <div>
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Secret env</div>
                  <div className="mt-2 text-white">{identity.smtpSecretEnv ?? 'Not set'}</div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => selectIdentity(identity)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/5"
                >
                  Edit rail
                </button>
                <button
                  onClick={() => testConnection(identity.id)}
                  disabled={pendingAction !== null}
                  className="rounded-full border border-cyan-300/24 bg-cyan-300/12 px-4 py-2 text-sm text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {pendingAction === 'test' && pendingIdentityId === identity.id ? 'Testing...' : 'Test Apple SMTP'}
                </button>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title={form.id ? 'Edit rail' : 'Add rail'} kicker="Apple SMTP identity config">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Label</span>
              <input
                value={form.label}
                onChange={(event) => updateForm('label', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Display name</span>
              <input
                value={form.displayName}
                onChange={(event) => updateForm('displayName', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Email address</span>
                <input
                  value={form.emailAddress}
                  onChange={(event) => updateForm('emailAddress', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Reply-To</span>
                <input
                  value={form.replyTo}
                  onChange={(event) => updateForm('replyTo', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.1fr_0.7fr_1.2fr]">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">SMTP host</span>
                <input
                  value={form.smtpHost}
                  onChange={(event) => updateForm('smtpHost', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Port</span>
                <input
                  value={form.smtpPort}
                  onChange={(event) => updateForm('smtpPort', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">SMTP username</span>
                <input
                  value={form.smtpUsername}
                  onChange={(event) => updateForm('smtpUsername', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Secret env variable</span>
              <input
                value={form.smtpSecretEnv}
                onChange={(event) => updateForm('smtpSecretEnv', event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Operator notes</span>
              <textarea
                rows={4}
                value={form.notes}
                onChange={(event) => updateForm('notes', event.target.value)}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
              />
            </label>

            <div className="flex flex-wrap gap-4 text-sm text-slate-300/76">
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <input type="checkbox" checked={form.trackingEnabled} onChange={(event) => updateForm('trackingEnabled', event.target.checked)} />
                Track links
              </label>
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <input type="checkbox" checked={form.pixelEnabled} onChange={(event) => updateForm('pixelEnabled', event.target.checked)} />
                Soft open pixel
              </label>
              <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                <input type="checkbox" checked={form.useTls} onChange={(event) => updateForm('useTls', event.target.checked)} />
                STARTTLS
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={saveIdentity}
                disabled={pendingAction !== null}
                className="rounded-full border border-emerald-300/24 bg-emerald-300/12 px-5 py-2.5 text-sm text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendingAction === 'save' ? 'Saving...' : form.id ? 'Update rail' : 'Create rail'}
              </button>
              <button
                onClick={resetForm}
                className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
              >
                New rail
              </button>
            </div>
          </div>
        </Panel>

        {feedback ? (
          <Panel title={feedback.title} kicker="Identity response">
            <div className="space-y-3 text-sm leading-6 text-slate-300/76">
              <StatusPill label={feedback.tone} state={feedback.tone} />
              <p>{feedback.body}</p>
            </div>
          </Panel>
        ) : null}

        <Panel title="Rail policy" kicker="Phase 1 operating rules">
          <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
            <li>Use Apple app-specific passwords only through env-backed secrets.</li>
            <li>Keep `reply_to` aligned with the visible sender unless there is a clear workflow reason not to.</li>
            <li>Test the rail before live sends. Passing SMTP auth is necessary but not the same as inbox placement.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
