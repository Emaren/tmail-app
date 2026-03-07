import Link from 'next/link';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { getMessages } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function MessagesPage() {
  const messages = await getMessages();

  return (
    <Panel title="Messages" kicker="Forensics and send history" className="pb-2">
      <div className="space-y-4">
        {messages.map((message) => (
          <Link
            key={message.id}
            href={`/dashboard/messages/${message.id}`}
            className="grid gap-4 rounded-[26px] border border-white/8 bg-white/[0.03] p-5 transition hover:border-cyan-200/20 hover:bg-white/[0.05] lg:grid-cols-[1.2fr_0.9fr]"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill label={message.status} state={message.status === 'Sent' ? 'healthy' : message.status === 'Needs Review' ? 'attention' : 'neutral'} />
                <span className="text-[0.68rem] uppercase tracking-[0.22em] text-slate-400">{message.identity}</span>
              </div>
              <h2 className="text-xl font-semibold text-white">{message.subject}</h2>
              <p className="max-w-2xl text-sm leading-6 text-slate-300/72">{message.preview}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm text-slate-300/72 md:grid-cols-5 lg:grid-cols-5">
              <div>
                <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Recipients</div>
                <div className="mt-2 text-base text-white">{message.recipients}</div>
              </div>
              <div>
                <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Opens</div>
                <div className="mt-2 text-base text-white">{message.opens}</div>
              </div>
              <div>
                <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Clicks</div>
                <div className="mt-2 text-base text-white">{message.clicks}</div>
              </div>
              <div>
                <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Replies</div>
                <div className="mt-2 text-base text-white">{message.replies}</div>
              </div>
              <div>
                <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">Mode</div>
                <div className="mt-2 text-base text-white">{message.sendMode ?? 'draft'}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
