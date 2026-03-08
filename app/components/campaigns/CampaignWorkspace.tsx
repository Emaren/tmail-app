'use client';

import Link from 'next/link';
import { useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { CampaignRunSummary, CampaignSchedulerStatus, CampaignSummary, IdentitySummary, TemplateSummary } from '@/lib/types';

interface CampaignWorkspaceProps {
  campaigns: CampaignSummary[];
  identities: IdentitySummary[];
  templates: TemplateSummary[];
  scheduler: CampaignSchedulerStatus;
  apiBase: string;
}

const STATUS_OPTIONS = ['draft', 'ready', 'scheduled', 'live', 'paused', 'completed'];

interface CampaignRunApiPayload {
  id: string;
  campaign_id?: string;
  message_id?: string | null;
  mode?: string;
  trigger_type?: string;
  status?: string;
  recipient_count?: number;
  sent_count?: number;
  summary?: string;
  started_at?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CampaignApiPayload {
  id: string;
  name?: string;
  objective?: string;
  status?: string;
  identity_id?: string;
  identity?: string;
  identity_label?: string;
  template_id?: string | null;
  template_name?: string | null;
  audience_label?: string;
  audience_emails?: string;
  audience_count?: number;
  send_window?: string;
  notes?: string;
  scheduled_for?: string | null;
  message_count?: number;
  sent_count?: number;
  open_events?: number;
  click_events?: number;
  reply_events?: number;
  conversion_events?: number;
  last_run?: CampaignRunApiPayload | null;
  recent_runs?: CampaignRunApiPayload[];
  created_at?: string;
  updated_at?: string;
}

interface CampaignSchedulerRunApiPayload {
  id: string;
  scope?: string;
  trigger_type?: string;
  status?: string;
  due_count?: number;
  launched_count?: number;
  failed_count?: number;
  summary?: string;
  campaign_ids?: string[];
  run_ids?: string[];
  started_at?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CampaignSchedulerStatusApiPayload {
  interval_minutes?: number;
  scheduled_count?: number;
  due_count?: number;
  next_scheduled_for?: string | null;
  last_run?: CampaignSchedulerRunApiPayload | null;
  recent_runs?: CampaignSchedulerRunApiPayload[];
}

function normalizeCampaignRun(payload: CampaignRunApiPayload): CampaignRunSummary {
  return {
    id: payload.id,
    campaignId: payload.campaign_id ?? '',
    messageId: payload.message_id ?? null,
    mode: payload.mode ?? 'live',
    triggerType: payload.trigger_type ?? 'manual',
    status: payload.status ?? 'pending',
    recipientCount: payload.recipient_count ?? 0,
    sentCount: payload.sent_count ?? 0,
    summary: payload.summary ?? '',
    startedAt: payload.started_at ?? new Date().toISOString(),
    completedAt: payload.completed_at ?? null,
    createdAt: payload.created_at ?? payload.started_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.completed_at ?? payload.started_at ?? new Date().toISOString(),
  };
}

function normalizeCampaign(payload: CampaignApiPayload): CampaignSummary {
  return {
    id: payload.id,
    name: payload.name ?? 'Untitled campaign',
    objective: payload.objective ?? '',
    status: payload.status ?? 'draft',
    identityId: payload.identity_id ?? '',
    identity: payload.identity ?? 'unknown',
    identityLabel: payload.identity_label ?? 'Identity',
    templateId: payload.template_id ?? null,
    templateName: payload.template_name ?? null,
    audienceLabel: payload.audience_label ?? '',
    audienceEmails: payload.audience_emails ?? '',
    audienceCount: payload.audience_count ?? 0,
    sendWindow: payload.send_window ?? '',
    notes: payload.notes ?? '',
    scheduledFor: payload.scheduled_for ?? null,
    messageCount: payload.message_count ?? 0,
    sentCount: payload.sent_count ?? 0,
    openEvents: payload.open_events ?? 0,
    clickEvents: payload.click_events ?? 0,
    replyEvents: payload.reply_events ?? 0,
    conversionEvents: payload.conversion_events ?? 0,
    lastRun: payload.last_run ? normalizeCampaignRun(payload.last_run) : null,
    recentRuns: Array.isArray(payload.recent_runs) ? payload.recent_runs.map(normalizeCampaignRun) : [],
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  };
}

function normalizeSchedulerRun(payload: CampaignSchedulerRunApiPayload) {
  return {
    id: payload.id,
    scope: payload.scope ?? 'campaigns',
    triggerType: payload.trigger_type ?? 'manual',
    status: payload.status ?? 'idle',
    dueCount: payload.due_count ?? 0,
    launchedCount: payload.launched_count ?? 0,
    failedCount: payload.failed_count ?? 0,
    summary: payload.summary ?? '',
    campaignIds: Array.isArray(payload.campaign_ids) ? payload.campaign_ids : [],
    runIds: Array.isArray(payload.run_ids) ? payload.run_ids : [],
    startedAt: payload.started_at ?? new Date().toISOString(),
    completedAt: payload.completed_at ?? null,
    createdAt: payload.created_at ?? payload.started_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.completed_at ?? payload.started_at ?? new Date().toISOString(),
  };
}

function normalizeSchedulerStatus(payload: CampaignSchedulerStatusApiPayload): CampaignSchedulerStatus {
  return {
    intervalMinutes: payload.interval_minutes ?? 5,
    scheduledCount: payload.scheduled_count ?? 0,
    dueCount: payload.due_count ?? 0,
    nextScheduledFor: payload.next_scheduled_for ?? null,
    lastRun: payload.last_run ? normalizeSchedulerRun(payload.last_run) : null,
    recentRuns: Array.isArray(payload.recent_runs) ? payload.recent_runs.map(normalizeSchedulerRun) : [],
  };
}

function formatTimestamp(value?: string | null) {
  if (!value) {
    return 'Not scheduled';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value.replace('T', ' ').slice(0, 16);
  }
  return date.toLocaleString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toUtcIso(localValue: string) {
  if (!localValue) {
    return '';
  }
  const date = new Date(localValue);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function campaignState(status: string) {
  if (status === 'completed' || status === 'live') {
    return 'healthy' as const;
  }
  if (status === 'ready' || status === 'scheduled') {
    return 'attention' as const;
  }
  return 'neutral' as const;
}

function runState(status: string) {
  if (status === 'sent') {
    return 'healthy' as const;
  }
  if (status === 'partial') {
    return 'attention' as const;
  }
  if (status === 'needs_review') {
    return 'critical' as const;
  }
  return 'neutral' as const;
}

function schedulerState(status: string) {
  if (status === 'completed') {
    return 'healthy' as const;
  }
  if (status === 'needs_review') {
    return 'critical' as const;
  }
  if (status === 'running') {
    return 'attention' as const;
  }
  return 'neutral' as const;
}

export default function CampaignWorkspace({ campaigns: initialCampaigns, identities, templates, scheduler: initialScheduler, apiBase }: CampaignWorkspaceProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [scheduler, setScheduler] = useState(initialScheduler);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    objective: '',
    identityId: identities[0]?.id ?? '',
    templateId: templates[0]?.id ?? '',
    audienceLabel: 'Founders / hand-picked',
    audienceEmails: '',
    sendWindow: 'Weekdays 09:00-11:00 local',
    notes: '',
    scheduledFor: '',
    status: 'draft',
  });

  function upsertCampaign(campaign: CampaignSummary) {
    setCampaigns((current) => {
      const others = current.filter((item) => item.id !== campaign.id);
      return [campaign, ...others];
    });
  }

  async function saveCampaign(payload: Record<string, unknown>, successMessage: string) {
    setFeedback(null);
    const response = await fetch(`${apiBase}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = (await response.json()) as { error?: string } & CampaignApiPayload;
    if (!response.ok) {
      throw new Error(result.error ?? 'Campaign save failed.');
    }
    const campaign = normalizeCampaign(result);
    upsertCampaign(campaign);
    setFeedback(successMessage);
  }

  async function createCampaign() {
    setPendingKey('create');
    try {
      await saveCampaign(
        {
          name: form.name,
          objective: form.objective,
          identity_id: form.identityId,
          template_id: form.templateId,
          audience_label: form.audienceLabel,
          audience_emails: form.audienceEmails,
          send_window: form.sendWindow,
          notes: form.notes,
          scheduled_for: toUtcIso(form.scheduledFor) || undefined,
          status: form.status,
        },
        'Campaign saved.',
      );
      setForm((current) => ({
        ...current,
        name: '',
        objective: '',
        audienceEmails: '',
        notes: '',
        scheduledFor: '',
        status: 'draft',
      }));
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Campaign save failed.');
    } finally {
      setPendingKey(null);
    }
  }

  async function updateCampaignStatus(campaign: CampaignSummary, status: string) {
    setPendingKey(campaign.id);
    try {
      await saveCampaign(
        {
          id: campaign.id,
          name: campaign.name,
          objective: campaign.objective,
          identity_id: campaign.identityId,
          template_id: campaign.templateId,
          audience_label: campaign.audienceLabel,
          audience_emails: campaign.audienceEmails,
          send_window: campaign.sendWindow,
          notes: campaign.notes,
          scheduled_for: campaign.scheduledFor || undefined,
          status,
        },
        `Campaign ${campaign.name} moved to ${status}.`,
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Status update failed.');
    } finally {
      setPendingKey(null);
    }
  }

  async function launchCampaign(campaign: CampaignSummary) {
    setPendingKey(`launch:${campaign.id}`);
    try {
      const response = await fetch(`${apiBase}/campaigns/${campaign.id}/launch`, {
        method: 'POST',
      });
      const result = (await response.json()) as { error?: string; campaign?: CampaignApiPayload; run?: CampaignRunApiPayload };
      if (!response.ok || !result.campaign) {
        throw new Error(result.error ?? 'Campaign launch failed.');
      }
      upsertCampaign(normalizeCampaign(result.campaign));
      setFeedback(result.run?.summary || `Campaign ${campaign.name} launched.`);
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Campaign launch failed.');
    } finally {
      setPendingKey(null);
    }
  }

  async function runDueCampaigns() {
    setPendingKey('run-due');
    try {
      const response = await fetch(`${apiBase}/campaigns/scheduler/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: 6, trigger_type: 'manual' }),
      });
      const result = (await response.json()) as {
        error?: string;
        items?: Array<{ campaign?: CampaignApiPayload; run?: CampaignRunApiPayload | null; error?: string }>;
        status?: CampaignSchedulerStatusApiPayload;
      };
      if (!response.ok) {
        throw new Error(result.error ?? 'Unable to run due campaigns.');
      }
      const items = Array.isArray(result.items) ? result.items : [];
      items.forEach((item) => {
        if (item.campaign) {
          upsertCampaign(normalizeCampaign(item.campaign));
        }
      });
      if (result.status) {
        setScheduler(normalizeSchedulerStatus(result.status));
      }
      setFeedback(items.length ? `Scheduler touched ${items.length} scheduled campaign${items.length === 1 ? '' : 's'}.` : 'No scheduled campaigns were due.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to run due campaigns.');
    } finally {
      setPendingKey(null);
    }
  }

  return (
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Panel title="Campaign queue" kicker="Executable growth surface">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="max-w-2xl text-sm leading-6 text-slate-300/74">
              Campaigns now hold recipient lists and can launch real individualized sends. One message is generated per recipient so contact tracking remains honest.
            </p>
            <button
              onClick={runDueCampaigns}
              disabled={pendingKey !== null}
              className="rounded-[18px] border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingKey === 'run-due' ? 'Running scheduler...' : 'Run scheduler now'}
            </button>
          </div>

          <div className="space-y-4">
            {campaigns.length ? campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{campaign.objective}</p>
                  </div>
                  <StatusPill label={campaign.status} state={campaignState(campaign.status)} />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-2 lg:grid-cols-4">
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Identity</div><div className="mt-2 text-white">{campaign.identity}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Template</div><div className="mt-2 text-white">{campaign.templateName ?? 'Unlinked'}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Audience</div><div className="mt-2 text-white">{campaign.audienceLabel}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Recipients</div><div className="mt-2 text-white">{campaign.audienceCount}</div></div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-2 lg:grid-cols-4">
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Window</div><div className="mt-2 text-white">{campaign.sendWindow || 'Unspecified'}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Scheduled</div><div className="mt-2 text-white">{formatTimestamp(campaign.scheduledFor)}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Messages</div><div className="mt-2 text-white">{campaign.messageCount}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Sent</div><div className="mt-2 text-white">{campaign.sentCount}</div></div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="space-y-2 text-sm leading-6 text-slate-300/74">
                    <div>{campaign.openEvents} opens · {campaign.clickEvents} clicks · {campaign.replyEvents} replies · {campaign.conversionEvents} conversions</div>
                    <div className="text-slate-400">{campaign.notes || 'No operator notes yet.'}</div>
                    {campaign.lastRun ? (
                      <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <StatusPill label={campaign.lastRun.status} state={runState(campaign.lastRun.status)} />
                          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{campaign.lastRun.triggerType}</span>
                          <span className="text-xs text-slate-400">{formatTimestamp(campaign.lastRun.startedAt)}</span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300/74">{campaign.lastRun.summary}</p>
                        <div className="mt-2 text-xs text-slate-400">{campaign.lastRun.sentCount} of {campaign.lastRun.recipientCount} recipient sends accepted.</div>
                        {campaign.lastRun.messageId ? (
                          <Link href={`/dashboard/messages/${campaign.lastRun.messageId}`} className="mt-3 inline-flex text-sm text-cyan-200 transition hover:text-cyan-100">
                            Open first launched message
                          </Link>
                        ) : null}
                      </div>
                    ) : (
                      <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                        No execution recorded yet.
                      </div>
                    )}
                  </div>

                  <div className="grid gap-3 md:min-w-[220px]">
                    <button
                      onClick={() => launchCampaign(campaign)}
                      disabled={pendingKey !== null}
                      className="rounded-2xl border border-emerald-300/24 bg-emerald-300/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendingKey === `launch:${campaign.id}` ? 'Launching now...' : 'Launch now'}
                    </button>
                    <select
                      value={campaign.status}
                      onChange={(event) => updateCampaignStatus(campaign, event.target.value)}
                      disabled={pendingKey !== null}
                      className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                    >
                      {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </div>
                </div>

                {campaign.recentRuns.length > 1 ? (
                  <div className="mt-5 rounded-[20px] border border-white/8 bg-white/[0.025] p-4">
                    <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Recent runs</div>
                    <div className="mt-3 space-y-2">
                      {campaign.recentRuns.slice(0, 3).map((run) => (
                        <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300/72">
                          <div className="flex flex-wrap items-center gap-3">
                            <StatusPill label={run.status} state={runState(run.status)} />
                            <span>{formatTimestamp(run.startedAt)}</span>
                          </div>
                          <div>{run.sentCount}/{run.recipientCount} sent</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </article>
            )) : (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300/72">
                No campaigns yet. Use the creation rail to define the first audience, template, and launch plan.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Scheduler control" kicker="VPS-timed campaign execution">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <StatusPill
                label={scheduler.lastRun?.status ?? (scheduler.dueCount ? 'due' : 'idle')}
                state={scheduler.lastRun ? schedulerState(scheduler.lastRun.status) : scheduler.dueCount ? 'attention' : 'neutral'}
              />
              <span className="text-sm text-slate-300/74">
                Expected cadence: every {scheduler.intervalMinutes} minute{scheduler.intervalMinutes === 1 ? '' : 's'} on the VPS.
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Scheduled campaigns</div>
                <div className="mt-2 text-2xl font-semibold text-white">{scheduler.scheduledCount}</div>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Due now</div>
                <div className="mt-2 text-2xl font-semibold text-white">{scheduler.dueCount}</div>
              </div>
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Next scheduled slot</div>
                <div className="mt-2 text-sm leading-6 text-white">{formatTimestamp(scheduler.nextScheduledFor)}</div>
              </div>
            </div>

            {scheduler.lastRun ? (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill label={scheduler.lastRun.status} state={schedulerState(scheduler.lastRun.status)} />
                  <span className="text-xs uppercase tracking-[0.22em] text-slate-400">{scheduler.lastRun.triggerType}</span>
                  <span className="text-xs text-slate-400">{formatTimestamp(scheduler.lastRun.startedAt)}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-300/74">{scheduler.lastRun.summary}</p>
                <div className="mt-2 text-xs text-slate-400">
                  {scheduler.lastRun.launchedCount} launched · {scheduler.lastRun.failedCount} failed review · {scheduler.lastRun.dueCount} due at start
                </div>
              </div>
            ) : (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-400">
                Scheduler history is empty. The first timer or manual run will show up here.
              </div>
            )}

            {scheduler.recentRuns.length > 1 ? (
              <div className="rounded-[20px] border border-white/8 bg-white/[0.025] p-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Recent scheduler runs</div>
                <div className="mt-3 space-y-2">
                  {scheduler.recentRuns.slice(0, 4).map((run) => (
                    <div key={run.id} className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300/72">
                      <div className="flex flex-wrap items-center gap-3">
                        <StatusPill label={run.status} state={schedulerState(run.status)} />
                        <span>{formatTimestamp(run.startedAt)}</span>
                      </div>
                      <div>{run.launchedCount}/{run.dueCount} launched</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              onClick={runDueCampaigns}
              disabled={pendingKey !== null}
              className="rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingKey === 'run-due' ? 'Running scheduler...' : 'Run scheduler now'}
            </button>
          </div>
        </Panel>

        <Panel title="Create campaign" kicker="Operator-planned send ladder">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Name</span>
              <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Objective</span>
              <input value={form.objective} onChange={(event) => setForm((current) => ({ ...current, objective: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Identity</span>
                <select value={form.identityId} onChange={(event) => setForm((current) => ({ ...current, identityId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                  {identities.map((identity) => <option key={identity.id} value={identity.id}>{identity.address}</option>)}
                </select>
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Template</span>
                <select value={form.templateId} onChange={(event) => setForm((current) => ({ ...current, templateId: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                  {templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Audience label</span>
              <input value={form.audienceLabel} onChange={(event) => setForm((current) => ({ ...current, audienceLabel: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Audience emails</span>
              <textarea
                value={form.audienceEmails}
                onChange={(event) => setForm((current) => ({ ...current, audienceEmails: event.target.value }))}
                rows={6}
                className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none"
                placeholder={'lead-one@example.com\nlead-two@example.com'}
              />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Send window</span>
                <input value={form.sendWindow} onChange={(event) => setForm((current) => ({ ...current, sendWindow: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Scheduled for</span>
                <input type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm((current) => ({ ...current, scheduledFor: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Notes</span>
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={5} className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Status</span>
              <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </label>
          </div>
          <button onClick={createCampaign} disabled={pendingKey !== null} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
            {pendingKey === 'create' ? 'Saving campaign...' : 'Save campaign'}
          </button>
          {feedback ? <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{feedback}</div> : null}
        </Panel>

        <Panel title="Build guidance" kicker="What this surface now does">
          <div className="space-y-3 text-sm leading-6 text-slate-300/74">
            <p>Campaigns are no longer just saved intent. `Launch now` creates one live send per listed recipient using the linked template and identity.</p>
            <p>`Run scheduler now` executes anything marked `scheduled` whose UTC-normalized scheduled time has passed. The VPS timer uses the same runner path.</p>
            <p>
              For placement proof, use <Link href="/dashboard/seed-tests" className="text-cyan-200">Seed Tests</Link>. For ad-hoc one-offs and manual edits, use <Link href="/dashboard/compose" className="text-cyan-200">Compose</Link>.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
