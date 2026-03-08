'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { ContactSummary } from '@/lib/types';

interface ContactsWorkspaceProps {
  contacts: ContactSummary[];
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

export default function ContactsWorkspace({ contacts: initialContacts, apiBase }: ContactsWorkspaceProps) {
  const [contacts, setContacts] = useState(initialContacts);
  const [selectedId, setSelectedId] = useState(initialContacts[0]?.id ?? '');
  const [selected, setSelected] = useState<ContactSummary | null>(initialContacts[0] ?? null);
  const [form, setForm] = useState({ id: '', emailAddress: '', displayName: '', company: '', tags: '', notes: '' });
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

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

  function startNewContact() {
    setSelectedId('');
    setSelected(null);
    setForm({ id: '', emailAddress: '', displayName: '', company: '', tags: '', notes: '' });
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
      setForm({ id: next.id, emailAddress: next.emailAddress, displayName: next.displayName, company: next.company, tags: next.tags.join(', '), notes: next.notes });
      setFeedback('Contact saved.');
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : 'Unable to save contact.');
    } finally {
      setPending(false);
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
