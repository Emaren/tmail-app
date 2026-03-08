'use client';

import Link from 'next/link';
import { useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { CampaignSummary, IdentitySummary, TemplateSummary } from '@/lib/types';

interface CampaignWorkspaceProps {
  campaigns: CampaignSummary[];
  identities: IdentitySummary[];
  templates: TemplateSummary[];
  apiBase: string;
}

const STATUS_OPTIONS = ['draft', 'ready', 'scheduled', 'live', 'paused'];

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
  send_window?: string;
  notes?: string;
  scheduled_for?: string | null;
  message_count?: number;
  sent_count?: number;
  open_events?: number;
  click_events?: number;
  reply_events?: number;
  conversion_events?: number;
  created_at?: string;
  updated_at?: string;
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
    sendWindow: payload.send_window ?? '',
    notes: payload.notes ?? '',
    scheduledFor: payload.scheduled_for ?? null,
    messageCount: payload.message_count ?? 0,
    sentCount: payload.sent_count ?? 0,
    openEvents: payload.open_events ?? 0,
    clickEvents: payload.click_events ?? 0,
    replyEvents: payload.reply_events ?? 0,
    conversionEvents: payload.conversion_events ?? 0,
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  };
}

export default function CampaignWorkspace({ campaigns: initialCampaigns, identities, templates, apiBase }: CampaignWorkspaceProps) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    objective: '',
    identityId: identities[0]?.id ?? '',
    templateId: templates[0]?.id ?? '',
    audienceLabel: 'Founders / hand-picked',
    sendWindow: 'Weekdays 09:00-11:00 local',
    notes: '',
    scheduledFor: '',
    status: 'draft',
  });

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
    setCampaigns((current) => {
      const others = current.filter((item) => item.id !== campaign.id);
      return [campaign, ...others];
    });
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
          send_window: form.sendWindow,
          notes: form.notes,
          scheduled_for: form.scheduledFor || undefined,
          status: form.status,
        },
        'Campaign saved.',
      );
      setForm((current) => ({ ...current, name: '', objective: '', notes: '', scheduledFor: '', status: 'draft' }));
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

  return (
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.08fr_0.92fr]">
      <div className="space-y-6">
        <Panel title="Campaign queue" kicker="Real growth surface">
          <div className="space-y-4">
            {campaigns.length ? campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{campaign.objective}</p>
                  </div>
                  <StatusPill label={campaign.status} state={campaign.status === 'live' ? 'healthy' : campaign.status === 'ready' || campaign.status === 'scheduled' ? 'attention' : 'neutral'} />
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-2 lg:grid-cols-4">
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Identity</div><div className="mt-2 text-white">{campaign.identity}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Template</div><div className="mt-2 text-white">{campaign.templateName ?? 'Unlinked'}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Audience</div><div className="mt-2 text-white">{campaign.audienceLabel}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Window</div><div className="mt-2 text-white">{campaign.sendWindow || 'Unspecified'}</div></div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
                  <div className="text-sm leading-6 text-slate-300/74">
                    <div>{campaign.messageCount} linked messages · {campaign.sentCount} sent</div>
                    <div>{campaign.openEvents} opens · {campaign.clickEvents} clicks · {campaign.replyEvents} replies · {campaign.conversionEvents} conversions</div>
                    <div className="mt-2 text-slate-400">{campaign.notes || 'No operator notes yet.'}</div>
                  </div>
                  <select
                    value={campaign.status}
                    onChange={(event) => updateCampaignStatus(campaign, event.target.value)}
                    disabled={pendingKey === campaign.id}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </div>
              </article>
            )) : (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300/72">
                No campaigns yet. Use the creation rail to establish the first planned sequence.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
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
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Send window</span>
              <input value={form.sendWindow} onChange={(event) => setForm((current) => ({ ...current, sendWindow: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Scheduled for</span>
                <input type="datetime-local" value={form.scheduledFor} onChange={(event) => setForm((current) => ({ ...current, scheduledFor: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Status</span>
                <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                  {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Notes</span>
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={6} className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none" />
            </label>
          </div>
          <button onClick={createCampaign} disabled={pendingKey !== null} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
            {pendingKey === 'create' ? 'Saving campaign...' : 'Save campaign'}
          </button>
          {feedback ? <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{feedback}</div> : null}
        </Panel>

        <Panel title="Build guidance" kicker="What this surface now represents">
          <div className="space-y-3 text-sm leading-6 text-slate-300/74">
            <p>Campaigns are now persisted. They are still operator-planned objects, not fully automated send sequences.</p>
            <p>Use templates for content consistency, seed tests for placement confidence, and this page for intent, audience, and state tracking.</p>
            <p>
              Next natural bridge: connect campaign drafts directly into <Link href="/dashboard/compose" className="text-cyan-200">Compose</Link> and <Link href="/dashboard/analytics" className="text-cyan-200">Analytics</Link>.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  );
}
