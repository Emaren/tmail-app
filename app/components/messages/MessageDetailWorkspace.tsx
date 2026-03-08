'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { MessageDetail } from '@/lib/types';

interface MessageDetailWorkspaceProps {
  message: MessageDetail;
  apiBase: string;
}

const OUTCOME_OPTIONS = [
  { value: 'reply_positive', label: 'Positive reply' },
  { value: 'reply_neutral', label: 'Neutral reply' },
  { value: 'reply_objection', label: 'Objection reply' },
  { value: 'meeting_booked', label: 'Meeting booked' },
  { value: 'converted', label: 'Converted' },
  { value: 'dead_thread', label: 'Dead thread' },
] as const;

function formatTimestamp(value?: string | null) {
  return value ? value.replace('T', ' ').slice(0, 19) : 'Pending';
}

export default function MessageDetailWorkspace({ message, apiBase }: MessageDetailWorkspaceProps) {
  const router = useRouter();
  const defaultContactId = message.contacts.length === 1 ? message.contacts[0].contactId : '';
  const [contactId, setContactId] = useState(defaultContactId);
  const [outcome, setOutcome] = useState<(typeof OUTCOME_OPTIONS)[number]['value']>('reply_positive');
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'healthy' | 'attention' | 'critical'; body: string } | null>(null);

  const selectedContact = useMemo(
    () => message.contacts.find((item) => item.contactId === contactId) ?? null,
    [contactId, message.contacts],
  );

  async function recordOutcome() {
    setPending(true);
    setFeedback(null);
    try {
      const response = await fetch(`${apiBase}/messages/${message.id}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outcome,
          contact_id: contactId || undefined,
          note,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to record outcome.');
      }
      setFeedback({ tone: 'healthy', body: 'Engagement outcome recorded.' });
      setNote('');
      router.refresh();
    } catch (error) {
      setFeedback({ tone: 'critical', body: error instanceof Error ? error.message : 'Unable to record outcome.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid gap-5 pb-10 xl:grid-cols-[1.16fr_0.84fr]">
      <Panel title={message.subject} kicker="Message detail">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label={message.status} state={message.status === 'Sent' ? 'healthy' : message.status === 'Needs Review' ? 'attention' : 'neutral'} />
            <span className="text-sm text-slate-300/70">Identity: {message.identity}</span>
            <span className="text-sm text-slate-300/70">Mode: {message.sendMode ?? 'draft'}</span>
            <span className="text-sm text-slate-300/70">Sent: {formatTimestamp(message.sentAt)}</span>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-200/80">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Preheader</p>
            <p className="mt-3">{message.preheader || 'No preheader set.'}</p>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-200/80">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Rendered preview</p>
            <div className="mt-4 overflow-hidden rounded-[20px] border border-white/8 bg-white">
              <iframe title="Message preview" srcDoc={message.htmlBody} className="h-[420px] w-full bg-white" sandbox="" />
            </div>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-200/80">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Text payload</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-300/74">{message.textBody}</pre>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Event timeline</p>
            <div className="mt-5 space-y-4 text-sm text-slate-300/76">
              {message.events.length ? (
                message.events.map((event) => (
                  <div key={event.id} className="border-l border-cyan-300/20 pl-4">
                    <p className="text-white">{event.type}</p>
                    <p className="mt-1 text-slate-400">{formatTimestamp(event.occurredAt)}</p>
                    <pre className="mt-2 overflow-x-auto whitespace-pre-wrap text-xs leading-5 text-slate-500">{JSON.stringify(event.payload, null, 2)}</pre>
                  </div>
                ))
              ) : (
                <p className="text-slate-400">No events recorded yet.</p>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Message metrics" kicker="Live repository counts">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"><p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Recipients</p><div className="mt-3 text-3xl text-white">{message.recipients}</div></div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"><p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Opens</p><div className="mt-3 text-3xl text-white">{message.opens}</div></div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"><p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Clicks</p><div className="mt-3 text-3xl text-white">{message.clicks}</div></div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4"><p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Replies</p><div className="mt-3 text-3xl text-white">{message.replies}</div></div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 sm:col-span-2"><p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Conversions</p><div className="mt-3 text-3xl text-white">{message.conversions}</div></div>
          </div>
        </Panel>

        <Panel title="Recipient contacts" kicker="Contact-aware delivery state">
          <div className="space-y-3 text-sm text-slate-300/74">
            {message.contacts.length ? (
              message.contacts.map((contact) => (
                <article key={contact.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{contact.displayName || contact.emailAddress}</div>
                      <div className="mt-1 text-xs text-slate-400">{contact.emailAddress}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StatusPill label={contact.deliveryStatus} state={contact.deliveryStatus === 'sent' ? 'healthy' : 'neutral'} />
                      <StatusPill label={contact.engagementStatus || 'quiet'} state={contact.conversionState ? 'healthy' : contact.replyState ? 'attention' : contact.inferredClickCount ? 'attention' : 'neutral'} />
                    </div>
                  </div>
                  <div className="mt-3 grid gap-3 text-xs text-slate-400 sm:grid-cols-3">
                    <div>Opens: <span className="text-slate-200">{contact.inferredOpenCount}</span></div>
                    <div>Clicks: <span className="text-slate-200">{contact.inferredClickCount}</span></div>
                    <div>Reply: <span className="text-slate-200">{contact.replyState || 'none'}</span></div>
                    <div>Conversion: <span className="text-slate-200">{contact.conversionState || 'none'}</span></div>
                    <div>Last touch: <span className="text-slate-200">{formatTimestamp(contact.lastConvertedAt || contact.lastRepliedAt || contact.lastClickedAt || contact.lastOpenedAt || contact.sentAt || contact.updatedAt)}</span></div>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-slate-400">No contact spine linked to this message yet.</div>
            )}
          </div>
        </Panel>

        <Panel title="Mark engagement" kicker="Strong signals only">
          <div className="space-y-4 text-sm text-slate-300/74">
            {message.contacts.length > 1 ? (
              <label className="space-y-2 block">
                <span className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Recipient contact</span>
                <select value={contactId} onChange={(event) => setContactId(event.target.value)} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                  <option value="">Select recipient</option>
                  {message.contacts.map((contact) => <option key={contact.contactId} value={contact.contactId}>{contact.displayName || contact.emailAddress}</option>)}
                </select>
              </label>
            ) : selectedContact ? (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/74">
                Outcome target: <span className="text-white">{selectedContact.displayName || selectedContact.emailAddress}</span>
              </div>
            ) : null}

            <label className="space-y-2 block">
              <span className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Outcome</span>
              <select value={outcome} onChange={(event) => setOutcome(event.target.value as (typeof OUTCOME_OPTIONS)[number]['value'])} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none">
                {OUTCOME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="space-y-2 block">
              <span className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Operator note</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} className="w-full rounded-[22px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none" placeholder="Short note about the reply, objection, booked meeting, or conversion." />
            </label>

            {feedback ? <div className={[
              'rounded-[18px] border px-4 py-3 text-sm',
              feedback.tone === 'healthy' ? 'border-cyan-300/18 bg-cyan-300/[0.07] text-cyan-50' : feedback.tone === 'attention' ? 'border-amber-300/18 bg-amber-300/[0.07] text-amber-50' : 'border-rose-300/20 bg-rose-300/[0.08] text-rose-50',
            ].join(' ')}>{feedback.body}</div> : null}

            <button onClick={recordOutcome} disabled={pending || (message.contacts.length > 1 && !contactId)} className="w-full rounded-[20px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60">
              {pending ? 'Recording...' : 'Record engagement outcome'}
            </button>
          </div>
        </Panel>

        <Panel title="Tracked destinations" kicker="Instrumentation output">
          <div className="space-y-3 text-sm text-slate-300/74">
            {message.trackedLinks.length ? (
              message.trackedLinks.map((link) => (
                <div key={link.token} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="font-medium text-white">{link.url}</div>
                  <div className="mt-2 text-xs text-slate-400">Token: {link.token}</div>
                </div>
              ))
            ) : (
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-slate-400">No tracked links stored.</div>
            )}
          </div>
        </Panel>
      </div>
    </div>
  );
}
