import Link from 'next/link';
import StatusPill from '@/components/shell/StatusPill';
import { MessageSummary } from '@/lib/types';

interface MessageSnapshotCardProps {
  message: MessageSummary;
  dense?: boolean;
}

function formatDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Pending';
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function formatTimeLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Edmonton',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function compactPreview(preview: string) {
  const normalized = preview
    .replace(/https?:\/\/[^\s]+/gi, (value) => {
      try {
        const url = new URL(value);
        const host = url.hostname.replace(/^www\./, '');
        if (url.pathname.includes('/api/tracking/click/')) {
          return `link via ${host}`;
        }
        const path = url.pathname && url.pathname !== '/' ? url.pathname.replace(/\/$/, '') : '';
        const shortPath = path.length > 18 ? `${path.slice(0, 15)}...` : path;
        return `${host}${shortPath}`;
      } catch {
        return 'link';
      }
    })
    .replace(/\s+/g, ' ')
    .trim();

  if (normalized.length <= 132) {
    return normalized;
  }
  return `${normalized.slice(0, 129).trimEnd()}...`;
}

function statusTone(status: MessageSummary['status']) {
  if (status === 'Sent') {
    return 'healthy' as const;
  }
  if (status === 'Needs Review') {
    return 'attention' as const;
  }
  return 'neutral' as const;
}

function timeKicker(message: MessageSummary) {
  if (message.status === 'Draft') {
    return 'Drafted';
  }
  if (message.sendMode === 'test') {
    return 'Tested';
  }
  return 'Sent';
}

export default function MessageSnapshotCard({ message, dense = false }: MessageSnapshotCardProps) {
  const stats = dense
    ? [
        ['Recipients', String(message.recipients)],
        ['Opens', String(message.opens)],
        ['Clicks', String(message.clicks)],
        ['Replies', String(message.replies)],
      ]
    : [
        ['Recipients', String(message.recipients)],
        ['Opens', String(message.opens)],
        ['Clicks', String(message.clicks)],
        ['Replies', String(message.replies)],
        ['Conversions', String(message.conversions)],
        ['Mode', message.sendMode ?? 'draft'],
      ];

  return (
    <Link
      href={`/dashboard/messages/${message.id}`}
      className="block rounded-[26px] border border-white/8 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transition hover:border-cyan-200/20 hover:bg-white/[0.05] sm:p-6"
    >
      <div className={dense ? 'grid gap-5 lg:grid-cols-[132px_minmax(0,1fr)] xl:gap-5' : 'grid gap-5 lg:grid-cols-[164px_minmax(0,1fr)] xl:gap-6'}>
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
          <div className="text-[0.62rem] uppercase tracking-[0.28em] text-cyan-200/65">{timeKicker(message)}</div>
          <div className="mt-3 text-[0.72rem] uppercase tracking-[0.24em] text-slate-400">{formatDateLabel(message.sentAt)}</div>
          <div className={dense ? 'mt-3 font-display text-[1.7rem] leading-none text-white' : 'mt-3 font-display text-[2rem] leading-none text-white'}>
            {formatTimeLabel(message.sentAt)}
          </div>
          <div className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500">America/Edmonton</div>
        </div>

        <div className="min-w-0">
          <div className={dense ? 'grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start' : 'grid gap-5 xl:grid-cols-[minmax(0,1fr)_372px] xl:items-start'}>
            <div className="min-w-0 space-y-3 xl:pr-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusPill label={message.status} state={statusTone(message.status)} />
                <span
                  title={message.identity}
                  className={dense ? 'max-w-[16ch] truncate text-[0.64rem] uppercase tracking-[0.22em] text-slate-400' : 'max-w-full truncate text-[0.68rem] uppercase tracking-[0.24em] text-slate-400'}
                >
                  {message.identity}
                </span>
              </div>
              <h3
                className={[
                  'break-anywhere font-semibold text-white',
                  dense
                    ? 'text-clamp-3 max-w-[18ch] text-[0.96rem] leading-[1.32] sm:max-w-[22ch] sm:text-[1rem]'
                    : 'max-w-[28ch] text-lg sm:max-w-[34ch] sm:text-[1.1rem]',
                ].join(' ')}
              >
                {message.subject}
              </h3>
              <p
                title={message.preview}
                className={[
                  'break-anywhere text-clamp-2 text-slate-300/72',
                  dense ? 'max-w-[26ch] text-[0.9rem] leading-7' : 'max-w-[56ch] text-sm leading-6',
                ].join(' ')}
              >
                {compactPreview(message.preview)}
              </p>
            </div>

            <div
              className={[
                'grid gap-3 rounded-[20px] border border-white/7 bg-black/10 p-4 text-left text-sm text-slate-300/72 xl:self-stretch',
                dense ? 'grid-cols-2 gap-x-3 gap-y-4 sm:grid-cols-4 xl:grid-cols-2 xl:max-w-[220px]' : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-2 xl:max-w-[372px]',
              ].join(' ')}
            >
              {stats.map(([label, value]) => (
                <div key={`${message.id}-${label}`} className="min-w-0">
                  <div className="text-[0.64rem] uppercase tracking-[0.22em] text-slate-400">{label}</div>
                  <div className={dense ? 'mt-2 truncate text-[0.96rem] text-white' : 'mt-2 truncate text-base text-white xl:text-[1.02rem]'} title={value}>
                    {value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
