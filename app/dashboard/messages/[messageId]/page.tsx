import { notFound } from 'next/navigation';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { getMessageDetail } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function MessageDetailPage({ params }: { params: Promise<{ messageId: string }> }) {
  const { messageId } = await params;
  const message = await getMessageDetail(messageId);

  if (!message) {
    notFound();
  }

  return (
    <div className="grid gap-5 pb-10 xl:grid-cols-[1.16fr_0.84fr]">
      <Panel title={message.subject} kicker="Message detail">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill label={message.status} state={message.status === 'Sent' ? 'healthy' : message.status === 'Needs Review' ? 'attention' : 'neutral'} />
            <span className="text-sm text-slate-300/70">Identity: {message.identity}</span>
            <span className="text-sm text-slate-300/70">Mode: {message.sendMode ?? 'draft'}</span>
            <span className="text-sm text-slate-300/70">Sent: {message.sentAt.replace('T', ' ').slice(0, 19)}</span>
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

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm leading-7 text-slate-200/80">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">HTML source</p>
            <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-slate-300/74">{message.htmlBody}</pre>
          </div>

          <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
            <p className="text-[0.7rem] uppercase tracking-[0.24em] text-slate-400">Event timeline</p>
            <div className="mt-5 space-y-4 text-sm text-slate-300/76">
              {message.events.length ? (
                message.events.map((event) => (
                  <div key={event.id} className="border-l border-cyan-300/20 pl-4">
                    <p className="text-white">{event.type}</p>
                    <p className="mt-1 text-slate-400">{event.occurredAt.replace('T', ' ').slice(0, 19)}</p>
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
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Recipients</p>
              <div className="mt-3 text-3xl text-white">{message.recipients}</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Opens</p>
              <div className="mt-3 text-3xl text-white">{message.opens}</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Clicks</p>
              <div className="mt-3 text-3xl text-white">{message.clicks}</div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Replies</p>
              <div className="mt-3 text-3xl text-white">{message.replies}</div>
            </div>
          </div>
        </Panel>

        <Panel title="Delivery metadata" kicker="Envelope and routing">
          <div className="space-y-4 text-sm text-slate-300/74">
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Recipients</p>
              <div className="mt-3 space-y-2">
                {message.recipientsList.length ? (
                  message.recipientsList.map((recipient) => (
                    <div key={recipient} className="rounded-full border border-white/8 px-3 py-2 text-white">
                      {recipient}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400">No recipient list stored.</p>
                )}
              </div>
            </div>
            <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Provider message ID</p>
              <div className="mt-3 break-all text-white">{message.providerMessageId ?? 'Not returned yet'}</div>
            </div>
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
