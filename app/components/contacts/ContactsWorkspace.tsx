'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { ContactSummary, SegmentSummary } from '@/lib/types';

interface ContactsWorkspaceProps {
  contacts: ContactSummary[];
  segments: SegmentSummary[];
  apiBase: string;
}

interface ContactApiPayload {
  id: string;
  email_address?: string;
  display_name?: string;
  company?: string;
  tags?: string[];
  source?: string;
  notes?: string;
  message_count?: number;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
  reply_count?: number;
  conversion_count?: number;
  engagement_score?: number;
  last_activity_at?: string | null;
  created_at?: string;
  updated_at?: string;
  history?: Array<{
    message_id?: string;
    subject?: string;
    status?: string;
    send_mode?: string;
    delivery_status?: string;
    inferred_open_count?: number;
    inferred_click_count?: number;
    reply_state?: string;
    conversion_state?: string;
    engagement_status?: string;
    sent_at?: string | null;
    updated_at?: string;
  }>;
}

interface SegmentApiPayload {
  id: string;
  name?: string;
  description?: string;
  match_mode?: 'any' | 'all';
  tags?: string[];
  company_contains?: string;
  source_filter?: string;
  engagement_filter?: 'any' | 'active' | 'clicked' | 'replied' | 'converted' | 'quiet';
  last_activity_days?: number | null;
  min_sent_count?: number | null;
  max_sent_count?: number | null;
  contact_count?: number;
  contact_emails?: string[];
  contacts_preview?: Array<{
    id?: string;
    email_address?: string;
    display_name?: string;
    company?: string;
  }>;
  created_at?: string;
  updated_at?: string;
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString() : 'No activity yet';
}

function engagementState(contact: ContactSummary) {
  if (contact.conversionCount) return 'healthy' as const;
  if (contact.replyCount || contact.clickCount) return 'attention' as const;
  return 'neutral' as const;
}

function normalizeContact(payload: ContactApiPayload): ContactSummary {
  return {
    id: payload.id,
    emailAddress: payload.email_address ?? '',
    displayName: payload.display_name ?? '',
    company: payload.company ?? '',
    tags: Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    source: payload.source ?? '',
    notes: payload.notes ?? '',
    messageCount: payload.message_count ?? 0,
    sentCount: payload.sent_count ?? 0,
    openCount: payload.open_count ?? 0,
    clickCount: payload.click_count ?? 0,
    replyCount: payload.reply_count ?? 0,
    conversionCount: payload.conversion_count ?? 0,
    engagementScore: payload.engagement_score ?? 0,
    lastActivityAt: payload.last_activity_at ?? null,
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
    history: Array.isArray(payload.history)
      ? payload.history.map((item) => ({
          messageId: item.message_id ?? '',
          subject: item.subject ?? 'Untitled message',
          status: item.status ?? 'Draft',
          sendMode: item.send_mode ?? 'draft',
          deliveryStatus: item.delivery_status ?? 'draft',
          inferredOpenCount: item.inferred_open_count ?? 0,
          inferredClickCount: item.inferred_click_count ?? 0,
          replyState: item.reply_state ?? '',
          conversionState: item.conversion_state ?? '',
          engagementStatus: item.engagement_status ?? '',
          sentAt: item.sent_at ?? null,
          updatedAt: item.updated_at ?? new Date().toISOString(),
        }))
      : [],
  };
}

function normalizeSegment(payload: SegmentApiPayload): SegmentSummary {
  return {
    id: payload.id,
    name: payload.name ?? 'Untitled segment',
    description: payload.description ?? '',
    matchMode: payload.match_mode ?? 'any',
    tags: Array.isArray(payload.tags) ? payload.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    companyContains: payload.company_contains ?? '',
    sourceFilter: payload.source_filter ?? '',
    engagementFilter: payload.engagement_filter ?? 'any',
    lastActivityDays: payload.last_activity_days ?? null,
    minSentCount: payload.min_sent_count ?? null,
    maxSentCount: payload.max_sent_count ?? null,
    contactCount: payload.contact_count ?? 0,
    contactEmails: Array.isArray(payload.contact_emails)
      ? payload.contact_emails.filter((email): email is string => typeof email === 'string')
      : [],
    contactsPreview: Array.isArray(payload.contacts_preview)
      ? payload.contacts_preview.flatMap((contact) =>
          contact.id && contact.email_address
            ? [{
                id: contact.id,
                emailAddress: contact.email_address,
                displayName: contact.display_name ?? '',
                company: contact.company ?? '',
              }]
            : [],
        )
      : [],
    createdAt: payload.created_at ?? new Date().toISOString(),
    updatedAt: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  };
}

export default function ContactsWorkspace({ contacts: initialContacts, segments: initialSegments, apiBase }: ContactsWorkspaceProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [segments, setSegments] = useState(initialSegments);
  const [selectedId, setSelectedId] = useState(initialContacts[0]?.id ?? '');
  const [selected, setSelected] = useState<ContactSummary | null>(initialContacts[0] ?? null);
  const [form, setForm] = useState({ id: '', emailAddress: '', displayName: '', company: '', source: '', tags: '', notes: '' });
  const [segmentForm, setSegmentForm] = useState({
    id: '',
    name: '',
    description: '',
    matchMode: 'any' as 'any' | 'all',
    companyContains: '',
    sourceFilter: '',
    engagementFilter: 'any' as SegmentSummary['engagementFilter'],
    lastActivityDays: '',
    minSentCount: '',
    maxSentCount: '',
    tags: '',
  });
  const [pending, setPending] = useState(false);
  const [segmentPending, setSegmentPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [segmentFeedback, setSegmentFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }

    let cancelled = false;
    async function loadDetail() {
      try {
        const response = await fetch(`${apiBase}/contacts/${selectedId}`);
        const payload = (await response.json()) as { error?: string } & ContactApiPayload;
        if (!response.ok) {
          throw new Error(payload.error ?? 'Unable to load contact.');
        }
        if (!cancelled) {
          const next = normalizeContact(payload);
          setSelected(next);
          setForm({
            id: next.id,
            emailAddress: next.emailAddress,
            displayName: next.displayName,
            company: next.company,
            source: next.source,
            tags: next.tags.join(', '),
            notes: next.notes,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setFeedback(error instanceof Error ? error.message : 'Unable to load contact.');
        }
      }
    }

    void loadDetail();
    return () => { cancelled = true; };
  }, [apiBase, selectedId]);

  const stats = useMemo(() => ({
    total: contacts.length,
    replied: contacts.filter((contact) => contact.replyCount > 0).length,
    converted: contacts.filter((contact) => contact.conversionCount > 0).length,
    active: contacts.filter((contact) => contact.clickCount > 0 || contact.replyCount > 0 || contact.conversionCount > 0).length,
  }), [contacts]);

  const segmentStats = useMemo(() => ({
    total: segments.length,
    covered: segments.reduce((sum, segment) => sum + segment.contactCount, 0),
  }), [segments]);

  function startNewContact() {
    setSelectedId('');
    setSelected(null);
    setForm({ id: '', emailAddress: '', displayName: '', company: '', source: '', tags: '', notes: '' });
  }

  async function saveContact() {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch(`${apiBase}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id || undefined,
          email_address: form.emailAddress,
          display_name: form.displayName,
          company: form.company,
          source: form.source,
          tags: form.tags.split(',').map((item) => item.trim()).filter(Boolean),
          notes: form.notes,
        }),
      });
      const payload = (await response.json()) as { error?: string } & ContactApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save contact.');
      }
      const next = normalizeContact(payload);
      setContacts((current) => {
        const others = current.filter((contact) => contact.id !== next.id);
        return [next, ...others];
      });
      setSelectedId(next.id);
      setSelected(next);
      setForm({ id: next.id, emailAddress: next.emailAddress, displayName: next.displayName, company: next.company, source: next.source, tags: next.tags.join(', '), notes: next.notes });
      setFeedback('Contact saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save contact.');
    } finally {
      setPending(false);
    }
  }

  async function saveSegment() {
    setSegmentPending(true);
    setSegmentFeedback(null);
    try {
      const response = await fetch(`${apiBase}/segments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: segmentForm.id || undefined,
          name: segmentForm.name,
          description: segmentForm.description,
          match_mode: segmentForm.matchMode,
          company_contains: segmentForm.companyContains,
          source_filter: segmentForm.sourceFilter,
          engagement_filter: segmentForm.engagementFilter,
          last_activity_days: segmentForm.lastActivityDays ? Number(segmentForm.lastActivityDays) : undefined,
          min_sent_count: segmentForm.minSentCount ? Number(segmentForm.minSentCount) : undefined,
          max_sent_count: segmentForm.maxSentCount ? Number(segmentForm.maxSentCount) : undefined,
          tags: segmentForm.tags.split(',').map((item) => item.trim()).filter(Boolean),
        }),
      });
      const payload = (await response.json()) as { error?: string } & SegmentApiPayload;
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to save segment.');
      }
      const next = normalizeSegment(payload);
      setSegments((current) => {
        const others = current.filter((segment) => segment.id !== next.id);
        return [next, ...others];
      });
      setSegmentForm({
        id: next.id,
        name: next.name,
        description: next.description,
        matchMode: next.matchMode,
        companyContains: next.companyContains,
        sourceFilter: next.sourceFilter,
        engagementFilter: next.engagementFilter,
        lastActivityDays: next.lastActivityDays?.toString() ?? '',
        minSentCount: next.minSentCount?.toString() ?? '',
        maxSentCount: next.maxSentCount?.toString() ?? '',
        tags: next.tags.join(', '),
      });
      setSegmentFeedback('Segment saved.');
    } catch (error) {
      setSegmentFeedback(error instanceof Error ? error.message : 'Unable to save segment.');
    } finally {
      setSegmentPending(false);
    }
  }

  return (
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.02fr_0.98fr]">
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Panel title={String(stats.total)} kicker="Contacts">
            <p className="text-sm text-slate-300/74">Known recipient records with message history attached.</p>
          </Panel>
          <Panel title={String(stats.active)} kicker="Active">
            <p className="text-sm text-slate-300/74">Contacts with clicks, replies, or conversions recorded.</p>
          </Panel>
          <Panel title={String(stats.replied)} kicker="Replied">
            <p className="text-sm text-slate-300/74">Contacts with at least one reply state logged.</p>
          </Panel>
          <Panel title={String(stats.converted)} kicker="Converted">
            <p className="text-sm text-slate-300/74">Contacts with booked meetings or confirmed conversions.</p>
          </Panel>
        </section>

        <Panel title="Contact ledger" kicker="Recipient spine">
          <div className="space-y-3">
            {contacts.length ? contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedId(contact.id)}
                className={[
                  'w-full rounded-[24px] border p-5 text-left transition',
                  selectedId === contact.id ? 'border-cyan-300/22 bg-cyan-300/[0.08]' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.05]'
                ].join(' ')}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-white">{contact.displayName || contact.emailAddress}</div>
                    <div className="mt-1 text-sm text-slate-400">{contact.emailAddress}</div>
                  </div>
                  <StatusPill label={`Score ${contact.engagementScore}`} state={engagementState(contact)} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-4">
                  <div>Sent <span className="text-white">{contact.sentCount}</span></div>
                  <div>Clicks <span className="text-white">{contact.clickCount}</span></div>
                  <div>Replies <span className="text-white">{contact.replyCount}</span></div>
                  <div>Conversions <span className="text-white">{contact.conversionCount}</span></div>
                </div>
                <div className="mt-3 text-xs text-slate-500">Last activity: {formatDate(contact.lastActivityAt)}</div>
              </button>
            )) : (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300/72">No contacts yet. Sending messages will automatically create recipient records here.</div>
            )}
          </div>
        </Panel>

        <Panel title="Audience segments" kicker="Reusable contact targeting">
          <div className="mb-5 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Saved segments</div>
              <div className="mt-2 text-2xl font-semibold text-white">{segmentStats.total}</div>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
              <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Total matched contacts</div>
              <div className="mt-2 text-2xl font-semibold text-white">{segmentStats.covered}</div>
            </div>
          </div>
          <div className="space-y-3">
            {segments.length ? segments.map((segment) => (
              <button
                key={segment.id}
                onClick={() => setSegmentForm({
                  id: segment.id,
                  name: segment.name,
                  description: segment.description,
                  matchMode: segment.matchMode,
                  companyContains: segment.companyContains,
                  sourceFilter: segment.sourceFilter,
                  engagementFilter: segment.engagementFilter,
                  lastActivityDays: segment.lastActivityDays?.toString() ?? '',
                  minSentCount: segment.minSentCount?.toString() ?? '',
                  maxSentCount: segment.maxSentCount?.toString() ?? '',
                  tags: segment.tags.join(', '),
                })}
                className="w-full rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-left transition hover:bg-white/[0.05]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-white">{segment.name}</div>
                    <div className="mt-1 text-sm text-slate-400">{segment.description || 'Tag-based reusable audience segment.'}</div>
                  </div>
                  <StatusPill label={`${segment.contactCount} contacts`} state={segment.contactCount ? 'healthy' : 'attention'} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {segment.tags.map((tag) => (
                    <span key={`${segment.id}-${tag}`} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      {segment.matchMode}:{tag}
                    </span>
                  ))}
                  {segment.companyContains ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      company:{segment.companyContains}
                    </span>
                  ) : null}
                  {segment.sourceFilter ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      source:{segment.sourceFilter}
                    </span>
                  ) : null}
                  {segment.engagementFilter !== 'any' ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      engagement:{segment.engagementFilter}
                    </span>
                  ) : null}
                  {segment.lastActivityDays !== null ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      active:{segment.lastActivityDays}d
                    </span>
                  ) : null}
                  {segment.minSentCount !== null ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      min sent:{segment.minSentCount}
                    </span>
                  ) : null}
                  {segment.maxSentCount !== null ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-300">
                      max sent:{segment.maxSentCount}
                    </span>
                  ) : null}
                </div>
                {segment.contactsPreview.length ? (
                  <div className="mt-3 text-xs text-slate-400">
                    Preview: {segment.contactsPreview.map((contact) => contact.displayName || contact.emailAddress).join(', ')}
                  </div>
                ) : (
                  <div className="mt-3 text-xs text-amber-200/80">No contacts match yet. Add or retag contacts to populate this segment.</div>
                )}
              </button>
            )) : (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/72">
                No reusable segments yet. Create one from contact tags and use it in campaigns.
              </div>
            )}
          </div>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title={selected ? 'Contact detail' : 'Create contact'} kicker="Metadata and recent outcomes">
          <div className="flex flex-wrap gap-3">
            <button onClick={startNewContact} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]">New contact</button>
            {selected?.history?.[0]?.messageId ? <Link href={`/dashboard/messages/${selected.history[0].messageId}`} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white transition hover:bg-white/[0.08]">Open latest message</Link> : null}
          </div>

          <div className="mt-5 grid gap-4">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Email address</span>
              <input value={form.emailAddress} onChange={(event) => setForm((current) => ({ ...current, emailAddress: event.target.value.toLowerCase().trimStart() }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Display name</span>
                <input value={form.displayName} onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Company</span>
                <input value={form.company} onChange={(event) => setForm((current) => ({ ...current, company: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Source</span>
              <input value={form.source} onChange={(event) => setForm((current) => ({ ...current, source: event.target.value.toLowerCase() }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="manual, import, founder note" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Tags</span>
              <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="founder, inbound, warm intro" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Notes</span>
              <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} rows={5} className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none" />
            </label>
          </div>

          <button onClick={saveContact} disabled={pending} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
            {pending ? 'Saving...' : 'Save contact'}
          </button>
          {feedback ? <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{feedback}</div> : null}
        </Panel>

        <Panel title="Create segment" kicker="Tag-driven audience definition">
          <div className="grid gap-4">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Name</span>
              <input value={segmentForm.name} onChange={(event) => setSegmentForm((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Description</span>
              <input value={segmentForm.description} onChange={(event) => setSegmentForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Match mode</span>
              <select value={segmentForm.matchMode} onChange={(event) => setSegmentForm((current) => ({ ...current, matchMode: event.target.value as 'any' | 'all' }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                <option value="any">Any tag matches</option>
                <option value="all">All tags required</option>
              </select>
            </label>
            <div className="grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Company contains</span>
                <input value={segmentForm.companyContains} onChange={(event) => setSegmentForm((current) => ({ ...current, companyContains: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="acme" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Source</span>
                <input value={segmentForm.sourceFilter} onChange={(event) => setSegmentForm((current) => ({ ...current, sourceFilter: event.target.value.toLowerCase() }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="manual" />
              </label>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Last activity within days</span>
                <input type="number" min="0" value={segmentForm.lastActivityDays} onChange={(event) => setSegmentForm((current) => ({ ...current, lastActivityDays: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="30" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Minimum sent count</span>
                <input type="number" min="0" value={segmentForm.minSentCount} onChange={(event) => setSegmentForm((current) => ({ ...current, minSentCount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="1" />
              </label>
              <label className="space-y-2 text-sm text-slate-300/78">
                <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Maximum sent count</span>
                <input type="number" min="0" value={segmentForm.maxSentCount} onChange={(event) => setSegmentForm((current) => ({ ...current, maxSentCount: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="5" />
              </label>
            </div>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Engagement filter</span>
              <select value={segmentForm.engagementFilter} onChange={(event) => setSegmentForm((current) => ({ ...current, engagementFilter: event.target.value as SegmentSummary['engagementFilter'] }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                <option value="any">Any engagement state</option>
                <option value="active">Any activity</option>
                <option value="clicked">Clicked</option>
                <option value="replied">Replied</option>
                <option value="converted">Converted</option>
                <option value="quiet">Quiet</option>
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Tags</span>
              <input value={segmentForm.tags} onChange={(event) => setSegmentForm((current) => ({ ...current, tags: event.target.value }))} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" placeholder="warm, founder, outbound" />
            </label>
          </div>

          <button onClick={saveSegment} disabled={segmentPending} className="mt-5 rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
            {segmentPending ? 'Saving segment...' : 'Save segment'}
          </button>
          {segmentFeedback ? <div className="mt-4 rounded-[18px] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-slate-200">{segmentFeedback}</div> : null}
        </Panel>

        <Panel title="Recent contact history" kicker="Message-linked outcomes">
          <div className="space-y-3">
            {selected?.history?.length ? selected.history.map((item) => (
              <Link key={`${item.messageId}-${item.updatedAt}`} href={`/dashboard/messages/${item.messageId}`} className="block rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:bg-white/[0.05]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{item.subject}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.sendMode} · {formatDate(item.sentAt || item.updatedAt)}</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill label={item.deliveryStatus} state={item.deliveryStatus === 'sent' ? 'healthy' : 'neutral'} />
                    <StatusPill label={item.conversionState || item.replyState || item.engagementStatus || 'quiet'} state={item.conversionState ? 'healthy' : item.replyState ? 'attention' : 'neutral'} />
                  </div>
                </div>
                <div className="mt-3 grid gap-3 text-xs text-slate-400 sm:grid-cols-4">
                  <div>Opens: <span className="text-slate-200">{item.inferredOpenCount}</span></div>
                  <div>Clicks: <span className="text-slate-200">{item.inferredClickCount}</span></div>
                  <div>Reply: <span className="text-slate-200">{item.replyState || 'none'}</span></div>
                  <div>Conversion: <span className="text-slate-200">{item.conversionState || 'none'}</span></div>
                </div>
              </Link>
            )) : (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/72">Select a contact to inspect recent linked messages and engagement outcomes.</div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
