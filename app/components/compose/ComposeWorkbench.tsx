'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { IdentitySummary } from '@/lib/types';

interface ComposeWorkbenchProps {
  identities: IdentitySummary[];
  apiBase: string;
}

type ActionType = 'draft' | 'send_test' | 'send_live';

export default function ComposeWorkbench({ identities, apiBase }: ComposeWorkbenchProps) {
  const [selectedIdentity, setSelectedIdentity] = useState(identities[0]?.id ?? '');
  const [recipients, setRecipients] = useState('seed@example.com');
  const [subject, setSubject] = useState('Wheat & Stone founder note, now instrumented through TMail');
  const [preheader, setPreheader] = useState('Compose in TMail. Validate in TMail. Send through Apple.');
  const [htmlBody, setHtmlBody] = useState(
    '<html><body><p>Hey there,</p><p>This is the rebuilt TMail compose experience taking shape. The goal is a clean founder-style message with stronger instrumentation and a deliverability checkpoint before every send.</p><p><a href="https://wheatandstone.ca">See the destination page</a></p></body></html>',
  );
  const [textBody, setTextBody] = useState(
    'Hey there,\n\nThis is the rebuilt TMail compose flow. The next backend pass will let this draft render into a real Apple SMTP send with tracked links, optional pixel injection, and a per-message timeline.',
  );
  const [trackingEnabled, setTrackingEnabled] = useState(true);
  const [pixelEnabled, setPixelEnabled] = useState(true);
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'healthy' | 'attention' | 'critical'; title: string; body: string; messageId?: string } | null>(null);

  useEffect(() => {
    if (!selectedIdentity && identities[0]?.id) {
      setSelectedIdentity(identities[0].id);
    }
  }, [identities, selectedIdentity]);

  async function submit(action: ActionType) {
    if (!apiBase) {
      setFeedback({
        tone: 'attention',
        title: 'API base URL missing',
        body: 'Set NEXT_PUBLIC_API_URL to the TMail API origin before using draft/save/send actions.',
      });
      return;
    }

    setPendingAction(action);
    setFeedback(null);

    try {
      const response = await fetch(`${apiBase}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identity_id: selectedIdentity,
          recipients: recipients.split(',').map((entry) => entry.trim()).filter(Boolean),
          subject,
          preheader,
          html_body: htmlBody,
          text_body: textBody,
          tracking_enabled: trackingEnabled,
          pixel_enabled: pixelEnabled,
          action,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.error ?? 'Request failed');
      }

      const tone = payload.status === 'Sent' ? 'healthy' : payload.status === 'Needs Review' ? 'attention' : 'healthy';
      const title =
        action === 'draft'
          ? 'Draft saved'
          : payload.status === 'Sent'
            ? 'Message sent'
            : 'Message needs review';
      const body = payload.error_message ?? payload.preview ?? 'The message was stored successfully.';
      setFeedback({ tone, title, body, messageId: payload.id });
    } catch (error) {
      setFeedback({
        tone: 'critical',
        title: 'Action failed',
        body: error instanceof Error ? error.message : 'Unknown request failure.',
      });
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.18fr_0.82fr] pb-10">
      <Panel title="Compose" kicker="Phase 1 live workbench">
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300/78">
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Sender identity</span>
              <select
                value={selectedIdentity}
                onChange={(event) => setSelectedIdentity(event.target.value)}
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
              <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Recipients</span>
              <input
                value={recipients}
                onChange={(event) => setRecipients(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300/78">
            <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Subject</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300/78">
            <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Preheader</span>
            <input
              value={preheader}
              onChange={(event) => setPreheader(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300/78">
            <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">HTML body</span>
            <textarea
              rows={14}
              value={htmlBody}
              onChange={(event) => setHtmlBody(event.target.value)}
              className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <label className="space-y-2 text-sm text-slate-300/78">
            <span className="text-[0.7rem] uppercase tracking-[0.26em] text-slate-400">Plain-text body</span>
            <textarea
              rows={8}
              value={textBody}
              onChange={(event) => setTextBody(event.target.value)}
              className="w-full rounded-[24px] border border-white/10 bg-white/5 px-4 py-4 text-white outline-none placeholder:text-slate-500"
            />
          </label>

          <div className="flex flex-wrap gap-4 text-sm text-slate-300/76">
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <input type="checkbox" checked={trackingEnabled} onChange={(event) => setTrackingEnabled(event.target.checked)} />
              Track links
            </label>
            <label className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <input type="checkbox" checked={pixelEnabled} onChange={(event) => setPixelEnabled(event.target.checked)} />
              Inject pixel
            </label>
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Readiness rail" kicker="Live backend checkpoint">
          <div className="space-y-3 text-sm text-slate-300/76">
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>API base configured</span>
              <StatusPill label={apiBase ? 'ready' : 'missing'} state={apiBase ? 'healthy' : 'attention'} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>Identity selected</span>
              <StatusPill label={selectedIdentity ? 'good' : 'missing'} state={selectedIdentity ? 'healthy' : 'attention'} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>Tracked links enabled</span>
              <StatusPill label={trackingEnabled ? 'on' : 'off'} state={trackingEnabled ? 'healthy' : 'attention'} />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
              <span>Pixel injection</span>
              <StatusPill label={pixelEnabled ? 'on' : 'off'} state={pixelEnabled ? 'healthy' : 'neutral'} />
            </div>
          </div>
        </Panel>

        <Panel title="Send actions" kicker="Draft and Apple SMTP flow">
          <div className="space-y-3">
            <button
              onClick={() => submit('draft')}
              disabled={pendingAction !== null}
              className="w-full rounded-2xl border border-cyan-300/24 bg-cyan-300/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-cyan-300/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingAction === 'draft' ? 'Saving draft...' : 'Save draft'}
            </button>
            <button
              onClick={() => submit('send_test')}
              disabled={pendingAction !== null}
              className="w-full rounded-2xl border border-amber-300/24 bg-amber-300/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-amber-300/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingAction === 'send_test' ? 'Attempting test send...' : 'Send test through Apple SMTP'}
            </button>
            <button
              onClick={() => submit('send_live')}
              disabled={pendingAction !== null}
              className="w-full rounded-2xl border border-emerald-300/24 bg-emerald-300/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingAction === 'send_live' ? 'Attempting live send...' : 'Queue live send'}
            </button>
          </div>
        </Panel>

        {feedback ? (
          <Panel title={feedback.title} kicker="API response">
            <div className="space-y-4 text-sm leading-6 text-slate-300/76">
              <StatusPill label={feedback.tone} state={feedback.tone} />
              <p>{feedback.body}</p>
              {feedback.messageId ? (
                <Link href={`/dashboard/messages/${feedback.messageId}`} className="inline-flex rounded-full border border-white/10 px-4 py-2 text-white transition hover:bg-white/5">
                  Open message detail
                </Link>
              ) : null}
            </div>
          </Panel>
        ) : null}

        <Panel title="Phase 1 truth" kicker="What this now does">
          <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
            <li>Stores drafts in the API-backed message repository.</li>
            <li>Attempts Apple SMTP sends through env-backed identity credentials.</li>
            <li>Instruments tracked links and optional pixel URLs before send.</li>
            <li>Records event timelines even when a send fails cleanly.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
