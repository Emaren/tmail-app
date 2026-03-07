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

interface PreflightCheck {
  level: 'pass' | 'info' | 'warning' | 'error';
  title: string;
  detail: string;
}

interface PreflightResult {
  status: 'ready' | 'warning' | 'blocked';
  score: number;
  summary: string;
  checks: PreflightCheck[];
  metrics: {
    recipient_count: number;
    link_count: number;
    image_count: number;
    subject_length: number;
    text_length: number;
  };
}

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
  const [preflightPending, setPreflightPending] = useState(false);
  const [preflight, setPreflight] = useState<PreflightResult | null>(null);
  const [feedback, setFeedback] = useState<{ tone: 'healthy' | 'attention' | 'critical'; title: string; body: string; messageId?: string } | null>(null);

  useEffect(() => {
    if (!selectedIdentity && identities[0]?.id) {
      setSelectedIdentity(identities[0].id);
    }
  }, [identities, selectedIdentity]);

  useEffect(() => {
    if (!apiBase) {
      setPreflight(null);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setPreflightPending(true);
      try {
        const response = await fetch(`${apiBase}/deliverability/preflight`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            identity_id: selectedIdentity,
            recipients: recipients.split(',').map((entry) => entry.trim()).filter(Boolean),
            subject,
            preheader,
            html_body: htmlBody,
            text_body: textBody,
            tracking_enabled: trackingEnabled,
            pixel_enabled: pixelEnabled,
          }),
        });

        if (!response.ok) {
          throw new Error('Preflight request failed');
        }

        const payload = (await response.json()) as PreflightResult;
        setPreflight(payload);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          setPreflight(null);
        }
      } finally {
        if (!controller.signal.aborted) {
          setPreflightPending(false);
        }
      }
    }, 320);

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [apiBase, htmlBody, pixelEnabled, preheader, recipients, selectedIdentity, subject, textBody, trackingEnabled]);

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
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.12fr_0.88fr]">
      <Panel title="Compose" kicker="Phase 1 live workbench">
        <div className="space-y-5">
          <div className="grid gap-4 lg:grid-cols-2">
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
        <Panel title="Readiness rail" kicker="Live preflight">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <div className="text-[0.62rem] uppercase tracking-[0.26em] text-slate-400">Readiness score</div>
                <div className="mt-3 text-5xl font-semibold text-white">{preflight?.score ?? '—'}</div>
              </div>
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] px-5 py-5">
                <div className="flex flex-wrap items-center gap-3">
                  <StatusPill
                    label={
                      !apiBase ? 'API missing' : preflightPending ? 'Checking' : preflight?.status === 'blocked' ? 'Blocked' : preflight?.status === 'warning' ? 'Warnings' : 'Ready'
                    }
                    state={
                      !apiBase ? 'attention' : preflight?.status === 'blocked' ? 'critical' : preflight?.status === 'warning' ? 'attention' : 'healthy'
                    }
                  />
                  <StatusPill label={trackingEnabled ? 'Tracked links on' : 'Tracking off'} state={trackingEnabled ? 'healthy' : 'attention'} />
                  <StatusPill label={pixelEnabled ? 'Soft open on' : 'Soft open off'} state={pixelEnabled ? 'neutral' : 'neutral'} />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-300/76">
                  {!apiBase
                    ? 'Set NEXT_PUBLIC_API_URL to enable backend preflight analysis.'
                    : preflightPending
                      ? 'Running draft checks against the live deliverability service.'
                      : preflight?.summary ?? 'Awaiting preflight result.'}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Recipients</div>
                <div className="mt-2 text-2xl text-white">{preflight?.metrics.recipient_count ?? recipients.split(',').filter(Boolean).length}</div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Links detected</div>
                <div className="mt-2 text-2xl text-white">{preflight?.metrics.link_count ?? '—'}</div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Images detected</div>
                <div className="mt-2 text-2xl text-white">{preflight?.metrics.image_count ?? '—'}</div>
              </div>
              <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Subject length</div>
                <div className="mt-2 text-2xl text-white">{preflight?.metrics.subject_length ?? subject.length}</div>
              </div>
            </div>

            <div className="space-y-3">
              {(preflight?.checks ?? []).map((check, index) => (
                <div key={`${check.title}-${index}`} className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill
                      label={check.level}
                      state={
                        check.level === 'pass'
                          ? 'healthy'
                          : check.level === 'warning'
                            ? 'attention'
                            : check.level === 'error'
                              ? 'critical'
                              : 'neutral'
                      }
                    />
                    <div className="text-sm font-medium text-white">{check.title}</div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300/74">{check.detail}</p>
                </div>
              ))}
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
              disabled={pendingAction !== null || preflight?.status === 'blocked'}
              className="w-full rounded-2xl border border-emerald-300/24 bg-emerald-300/12 px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-emerald-300/16 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pendingAction === 'send_live'
                ? 'Attempting live send...'
                : preflight?.status === 'blocked'
                  ? 'Resolve blocking issues before live send'
                  : 'Queue live send'}
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
