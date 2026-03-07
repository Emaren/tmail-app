'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import {
  HealthState,
  IdentitySummary,
  SeedInboxSummary,
  SeedTestResult,
  SeedTestRunDetail,
  SeedTestRunSummary,
  TemplateSummary,
} from '@/lib/types';

interface SeedLabWorkspaceProps {
  identities: IdentitySummary[];
  templates: TemplateSummary[];
  seedInboxes: SeedInboxSummary[];
  seedRuns: SeedTestRunSummary[];
  apiBase: string;
}

interface FeedbackState {
  tone: HealthState;
  title: string;
  body: string;
}

interface LaunchFormState {
  identityId: string;
  templateId: string;
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
}

function createLaunchForm(identities: IdentitySummary[], templates: TemplateSummary[]): LaunchFormState {
  const firstTemplate = templates[0];
  return {
    identityId: identities[0]?.id ?? '',
    templateId: firstTemplate?.id ?? '',
    subject: firstTemplate?.subject ?? 'TMail seed test probe',
    preheader: firstTemplate?.preheader ?? 'Seed inbox validation run from TMail.',
    htmlBody: firstTemplate?.htmlBody ?? '<html><body><p>This is a TMail seed test probe.</p></body></html>',
    textBody: firstTemplate?.textBody ?? 'This is a TMail seed test probe.',
  };
}

function upsertSeedInbox(items: SeedInboxSummary[], next: SeedInboxSummary): SeedInboxSummary[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [...items, next];
  }
  const updated = [...items];
  updated[existingIndex] = next;
  return updated;
}

function upsertSeedRun(items: SeedTestRunSummary[], next: SeedTestRunSummary): SeedTestRunSummary[] {
  const existingIndex = items.findIndex((item) => item.id === next.id);
  if (existingIndex === -1) {
    return [next, ...items];
  }
  const updated = [...items];
  updated[existingIndex] = next;
  return updated.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

function normalizeSeedInboxResponse(item: Record<string, unknown>): SeedInboxSummary {
  const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
  const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : createdAt;
  return {
    id: typeof item.id === 'string' ? item.id : `seed-${Date.now()}`,
    provider: typeof item.provider === 'string' ? item.provider : 'Unknown',
    label: typeof item.label === 'string' ? item.label : 'Seed inbox',
    emailAddress: typeof item.email_address === 'string' ? item.email_address : '',
    notes: typeof item.notes === 'string' ? item.notes : '',
    enabled: typeof item.enabled === 'boolean' ? item.enabled : false,
    createdAt,
    updatedAt,
  };
}

function normalizeSeedResultResponse(item: Record<string, unknown>): SeedTestResult {
  return {
    id: typeof item.id === 'string' ? item.id : `seedresult-${Date.now()}`,
    seedInboxId: typeof item.seed_inbox_id === 'string' ? item.seed_inbox_id : 'seed-unknown',
    provider: typeof item.provider === 'string' ? item.provider : 'Unknown',
    label: typeof item.label === 'string' ? item.label : 'Seed inbox',
    emailAddress: typeof item.email_address === 'string' ? item.email_address : '',
    accepted: typeof item.accepted === 'boolean' ? item.accepted : null,
    placement: typeof item.placement === 'string' ? item.placement : 'pending',
    renderStatus: typeof item.render_status === 'string' ? item.render_status : 'pending',
    notes: typeof item.notes === 'string' ? item.notes : '',
    checkedAt: typeof item.checked_at === 'string' ? item.checked_at : null,
    updatedAt: typeof item.updated_at === 'string' ? item.updated_at : new Date().toISOString(),
  };
}

function normalizeSeedRunResponse(item: Record<string, unknown>): SeedTestRunDetail {
  const createdAt = typeof item.created_at === 'string' ? item.created_at : new Date().toISOString();
  const updatedAt = typeof item.updated_at === 'string' ? item.updated_at : createdAt;
  return {
    id: typeof item.id === 'string' ? item.id : `seedrun-${Date.now()}`,
    identityId: typeof item.identity_id === 'string' ? item.identity_id : '',
    identity: typeof item.identity === 'string' ? item.identity : 'unknown',
    identityLabel: typeof item.identity_label === 'string' ? item.identity_label : 'Identity',
    messageId: typeof item.message_id === 'string' ? item.message_id : null,
    templateId: typeof item.template_id === 'string' ? item.template_id : null,
    subject: typeof item.subject === 'string' ? item.subject : 'Untitled seed run',
    status: typeof item.status === 'string' ? item.status : 'pending',
    summary: typeof item.summary === 'string' ? item.summary : 'Awaiting seed results.',
    resultCount: typeof item.result_count === 'number' ? item.result_count : 0,
    completedCount: typeof item.completed_count === 'number' ? item.completed_count : 0,
    inboxCount: typeof item.inbox_count === 'number' ? item.inbox_count : 0,
    spamCount: typeof item.spam_count === 'number' ? item.spam_count : 0,
    createdAt,
    updatedAt,
    sentAt: typeof item.sent_at === 'string' ? item.sent_at : null,
    results: Array.isArray(item.results)
      ? item.results.map((result) => normalizeSeedResultResponse(result as Record<string, unknown>))
      : [],
  };
}

export default function SeedLabWorkspace({ identities, templates, seedInboxes, seedRuns, apiBase }: SeedLabWorkspaceProps) {
  const [inboxes, setInboxes] = useState(seedInboxes);
  const [runs, setRuns] = useState(seedRuns);
  const [selectedRunId, setSelectedRunId] = useState(seedRuns[0]?.id ?? '');
  const [runDetails, setRunDetails] = useState<Record<string, SeedTestRunDetail>>({});
  const [launchForm, setLaunchForm] = useState(() => createLaunchForm(identities, templates));
  const [pendingInboxId, setPendingInboxId] = useState<string | null>(null);
  const [launchPending, setLaunchPending] = useState(false);
  const [resultPending, setResultPending] = useState(false);
  const [detailPending, setDetailPending] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const selectedRun = useMemo(
    () => (selectedRunId ? runDetails[selectedRunId] ?? null : null),
    [runDetails, selectedRunId],
  );

  useEffect(() => {
    if (!selectedRunId || runDetails[selectedRunId]) {
      return;
    }

    let cancelled = false;
    async function loadRun() {
      setDetailPending(true);
      try {
        const response = await fetch(`${apiBase}/seed-tests/runs/${selectedRunId}`, {
          headers: { Accept: 'application/json' },
        });
        const payload = (await response.json()) as Record<string, unknown>;
        if (!response.ok) {
          throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to load seed run.');
        }
        if (!cancelled) {
          setRunDetails((current) => ({
            ...current,
            [selectedRunId]: normalizeSeedRunResponse(payload),
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback({
            tone: 'attention',
            title: 'Seed run detail unavailable',
            body: error instanceof Error ? error.message : 'Unable to load the selected run.',
          });
        }
      } finally {
        if (!cancelled) {
          setDetailPending(false);
        }
      }
    }

    void loadRun();
    return () => {
      cancelled = true;
    };
  }, [apiBase, runDetails, selectedRunId]);

  function updateLaunchForm<K extends keyof LaunchFormState>(key: K, value: LaunchFormState[K]) {
    setLaunchForm((current) => ({ ...current, [key]: value }));
  }

  function applyTemplate(templateId: string) {
    const template = templates.find((item) => item.id === templateId);
    if (!template) {
      return;
    }

    setLaunchForm((current) => ({
      ...current,
      templateId: template.id,
      subject: template.subject,
      preheader: template.preheader,
      htmlBody: template.htmlBody,
      textBody: template.textBody,
    }));
  }

  function updateRunResult(seedInboxId: string, updater: (current: SeedTestResult) => SeedTestResult) {
    if (!selectedRunId) {
      return;
    }

    setRunDetails((current) => {
      const active = current[selectedRunId];
      if (!active) {
        return current;
      }
      return {
        ...current,
        [selectedRunId]: {
          ...active,
          results: active.results.map((result) => (result.seedInboxId === seedInboxId ? updater(result) : result)),
        },
      };
    });
  }

  async function saveSeedInbox(inbox: SeedInboxSummary) {
    if (inbox.enabled && !inbox.emailAddress.trim()) {
      setFeedback({
        tone: 'attention',
        title: 'Seed inbox email required',
        body: `Add a real ${inbox.provider} address before enabling ${inbox.label}.`,
      });
      return;
    }

    setPendingInboxId(inbox.id);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/seed-tests/inboxes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inbox.id,
          provider: inbox.provider,
          label: inbox.label,
          email_address: inbox.emailAddress,
          notes: inbox.notes,
          enabled: inbox.enabled,
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to save seed inbox.');
      }

      const normalized = normalizeSeedInboxResponse(payload);
      setInboxes((current) => upsertSeedInbox(current, normalized));
      setFeedback({
        tone: 'healthy',
        title: 'Seed inbox saved',
        body: `${normalized.label} is ready for the next real inbox placement run.`,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Seed inbox save failed',
        body: error instanceof Error ? error.message : 'Unknown seed inbox save failure.',
      });
    } finally {
      setPendingInboxId(null);
    }
  }

  async function launchRun() {
    setLaunchPending(true);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/seed-tests/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity_id: launchForm.identityId,
          template_id: launchForm.templateId || null,
          subject: launchForm.subject,
          preheader: launchForm.preheader,
          html_body: launchForm.htmlBody,
          text_body: launchForm.textBody,
          tracking_enabled: true,
          pixel_enabled: true,
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to launch seed run.');
      }

      const normalized = normalizeSeedRunResponse(payload);
      setRuns((current) => upsertSeedRun(current, normalized));
      setRunDetails((current) => ({ ...current, [normalized.id]: normalized }));
      setSelectedRunId(normalized.id);
      setFeedback({
        tone: normalized.status === 'sent' ? 'healthy' : 'attention',
        title: normalized.status === 'sent' ? 'Seed run launched' : 'Seed run needs review',
        body: normalized.summary,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Seed run launch failed',
        body: error instanceof Error ? error.message : 'Unknown seed run failure.',
      });
    } finally {
      setLaunchPending(false);
    }
  }

  async function saveRunResults() {
    if (!selectedRun) {
      return;
    }

    setResultPending(true);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/seed-tests/runs/${selectedRun.id}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          results: selectedRun.results.map((result) => ({
            seed_inbox_id: result.seedInboxId,
            accepted: result.accepted,
            placement: result.placement,
            render_status: result.renderStatus,
            notes: result.notes,
          })),
        }),
      });

      const payload = (await response.json()) as Record<string, unknown>;
      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Unable to save seed results.');
      }

      const normalized = normalizeSeedRunResponse(payload);
      setRunDetails((current) => ({ ...current, [normalized.id]: normalized }));
      setRuns((current) => upsertSeedRun(current, normalized));
      setFeedback({
        tone: 'healthy',
        title: 'Seed results saved',
        body: normalized.summary,
      });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Seed result save failed',
        body: error instanceof Error ? error.message : 'Unknown seed result failure.',
      });
    } finally {
      setResultPending(false);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="grid gap-6 2xl:grid-cols-[1.04fr_0.96fr]">
        <Panel title="Seed inbox matrix" kicker="Real inbox targets">
          <div className="space-y-4">
            {inboxes.map((inbox) => (
              <article key={inbox.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={inbox.enabled ? 'enabled' : 'disabled'} state={inbox.enabled ? 'healthy' : 'neutral'} />
                      <span className="text-[0.64rem] uppercase tracking-[0.24em] text-cyan-200/68">{inbox.provider}</span>
                    </div>
                    <h2 className="mt-3 text-2xl font-semibold text-white">{inbox.label}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300/72">{inbox.notes || 'No operator note yet.'}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                  <label className="space-y-2 text-sm text-slate-300/78">
                    <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Inbox address</span>
                    <input
                      value={inbox.emailAddress}
                      onChange={(event) =>
                        setInboxes((current) => current.map((item) => (item.id === inbox.id ? { ...item, emailAddress: event.target.value } : item)))
                      }
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                    />
                  </label>
                  <label className="flex items-end gap-3 rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-4 text-sm text-slate-300/76">
                    <input
                      type="checkbox"
                      checked={inbox.enabled}
                      onChange={(event) =>
                        setInboxes((current) => current.map((item) => (item.id === inbox.id ? { ...item, enabled: event.target.checked } : item)))
                      }
                    />
                    Enable this provider in launch runs
                  </label>
                </div>

                <label className="mt-4 block space-y-2 text-sm text-slate-300/78">
                  <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Operator notes</span>
                  <textarea
                    rows={3}
                    value={inbox.notes}
                    onChange={(event) =>
                      setInboxes((current) => current.map((item) => (item.id === inbox.id ? { ...item, notes: event.target.value } : item)))
                    }
                    className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
                  />
                </label>

                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => saveSeedInbox(inbox)}
                    disabled={pendingInboxId !== null}
                    className="rounded-full border border-emerald-300/24 bg-emerald-300/12 px-5 py-2.5 text-sm text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pendingInboxId === inbox.id ? 'Saving...' : 'Save inbox'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Launch a seed run" kicker="Send through Apple, verify in real inboxes">
            <div className="grid gap-4">
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">
                <label className="space-y-2 text-sm text-slate-300/78">
                  <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Identity</span>
                  <select
                    value={launchForm.identityId}
                    onChange={(event) => updateLaunchForm('identityId', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  >
                    {identities.map((identity) => (
                      <option key={identity.id} value={identity.id}>
                        {identity.address}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-300/78">
                  <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Template</span>
                  <select
                    value={launchForm.templateId}
                    onChange={(event) => updateLaunchForm('templateId', event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                  >
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex items-end">
                  <button
                    onClick={() => applyTemplate(launchForm.templateId)}
                    className="w-full rounded-full border border-cyan-300/22 bg-cyan-300/12 px-4 py-3 text-sm text-white transition hover:bg-cyan-300/16"
                  >
                    Load template
                  </button>
                </div>
              </div>

              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Subject</span>
                <input
                  value={launchForm.subject}
                  onChange={(event) => updateLaunchForm('subject', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Preheader</span>
                <input
                  value={launchForm.preheader}
                  onChange={(event) => updateLaunchForm('preheader', event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">HTML body</span>
                <textarea
                  rows={9}
                  value={launchForm.htmlBody}
                  onChange={(event) => updateLaunchForm('htmlBody', event.target.value)}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 font-mono text-[0.9rem] text-white outline-none"
                />
              </label>

              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Plain-text body</span>
                <textarea
                  rows={6}
                  value={launchForm.textBody}
                  onChange={(event) => updateLaunchForm('textBody', event.target.value)}
                  className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 font-mono text-[0.9rem] text-white outline-none"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={launchRun}
                  disabled={launchPending}
                  className="rounded-full border border-amber-300/24 bg-amber-300/12 px-5 py-2.5 text-sm text-white transition hover:bg-amber-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {launchPending ? 'Launching...' : 'Launch seed run'}
                </button>
                <Link
                  href="/dashboard/compose"
                  className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
                >
                  Open compose workbench
                </Link>
              </div>
            </div>
          </Panel>

          {feedback ? (
            <Panel title={feedback.title} kicker="Seed lab response">
              <div className="space-y-3 text-sm leading-6 text-slate-300/76">
                <StatusPill label={feedback.tone} state={feedback.tone} />
                <p>{feedback.body}</p>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 2xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Recent seed runs" kicker="Acceptance and placement history">
          <div className="space-y-4">
            {runs.map((run) => (
              <button
                key={run.id}
                onClick={() => setSelectedRunId(run.id)}
                className="block w-full rounded-[26px] border border-white/8 bg-white/[0.03] p-5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200/20 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={run.status} state={run.status === 'completed' ? 'healthy' : run.status === 'needs_review' ? 'attention' : 'neutral'} />
                      <span className="text-[0.64rem] uppercase tracking-[0.24em] text-cyan-200/68">{run.identity}</span>
                    </div>
                    <h2 className="mt-3 text-xl font-semibold text-white">{run.subject}</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300/72">{run.summary}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-sm text-slate-300/72 md:min-w-[220px]">
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Done</div>
                      <div className="mt-2 text-white">{run.completedCount}/{run.resultCount}</div>
                    </div>
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Inbox</div>
                      <div className="mt-2 text-white">{run.inboxCount}</div>
                    </div>
                    <div>
                      <div className="text-[0.62rem] uppercase tracking-[0.22em] text-slate-400">Spam</div>
                      <div className="mt-2 text-white">{run.spamCount}</div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="Result capture" kicker="Record what the real inboxes did">
          {!selectedRunId ? (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 text-sm leading-7 text-slate-300/74">
              Launch a seed run or choose an existing one to record inbox placement, render health, and acceptance.
            </div>
          ) : detailPending && !selectedRun ? (
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5 text-sm leading-7 text-slate-300/74">
              Loading seed run detail...
            </div>
          ) : selectedRun ? (
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill label={selectedRun.status} state={selectedRun.status === 'completed' ? 'healthy' : selectedRun.status === 'needs_review' ? 'attention' : 'neutral'} />
                  <div className="text-sm text-slate-300/72">{selectedRun.subject}</div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300/74">{selectedRun.summary}</p>
              </div>

              {selectedRun.results.map((result) => (
                <article key={result.seedInboxId} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill label={result.provider} state="neutral" />
                        <StatusPill label={result.placement} state={result.placement === 'spam' ? 'critical' : result.placement === 'inbox' ? 'healthy' : 'attention'} />
                      </div>
                      <h3 className="mt-3 text-lg font-semibold text-white">{result.label}</h3>
                      <p className="mt-2 text-sm text-slate-300/72">{result.emailAddress || 'Email not configured'}</p>
                    </div>
                    <div className="text-sm text-slate-400">{result.checkedAt ? new Date(result.checkedAt).toLocaleString() : 'Pending review'}</div>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <label className="space-y-2 text-sm text-slate-300/78">
                      <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Accepted</span>
                      <select
                        value={result.accepted === null ? 'pending' : result.accepted ? 'yes' : 'no'}
                        onChange={(event) =>
                          updateRunResult(result.seedInboxId, (current) => ({
                            ...current,
                            accepted: event.target.value === 'pending' ? null : event.target.value === 'yes',
                          }))
                        }
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-slate-300/78">
                      <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Placement</span>
                      <select
                        value={result.placement}
                        onChange={(event) => updateRunResult(result.seedInboxId, (current) => ({ ...current, placement: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="inbox">Inbox</option>
                        <option value="promotions">Promotions</option>
                        <option value="spam">Spam</option>
                        <option value="missing">Missing</option>
                      </select>
                    </label>

                    <label className="space-y-2 text-sm text-slate-300/78">
                      <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Render</span>
                      <select
                        value={result.renderStatus}
                        onChange={(event) => updateRunResult(result.seedInboxId, (current) => ({ ...current, renderStatus: event.target.value }))}
                        className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="clean">Clean</option>
                        <option value="issues">Issues</option>
                      </select>
                    </label>
                  </div>

                  <label className="mt-4 block space-y-2 text-sm text-slate-300/78">
                    <span className="text-[0.68rem] uppercase tracking-[0.24em] text-slate-400">Notes</span>
                    <textarea
                      rows={3}
                      value={result.notes}
                      onChange={(event) => updateRunResult(result.seedInboxId, (current) => ({ ...current, notes: event.target.value }))}
                      className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
                    />
                  </label>
                </article>
              ))}

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={saveRunResults}
                  disabled={resultPending}
                  className="rounded-full border border-emerald-300/24 bg-emerald-300/12 px-5 py-2.5 text-sm text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {resultPending ? 'Saving results...' : 'Save seed results'}
                </button>
                {selectedRun.messageId ? (
                  <Link
                    href={`/dashboard/messages/${selectedRun.messageId}`}
                    className="rounded-full border border-white/10 px-5 py-2.5 text-sm text-white transition hover:bg-white/5"
                  >
                    Open message detail
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </Panel>
      </div>
    </div>
  );
}
