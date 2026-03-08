import Link from 'next/link';
import StatCard from '@/components/dashboard/StatCard';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { AnalyticsSummary } from '@/lib/types';

function scoreState(score: number) {
  if (score >= 80) return 'healthy';
  if (score >= 55) return 'attention';
  return 'critical';
}

export default function AnalyticsWorkspace({ data }: { data: AnalyticsSummary }) {
  const identityRows = [...data.identityPerformance].sort((left, right) => right.engagementScore - left.engagementScore);
  const templateRows = [...data.templatePerformance].sort((left, right) => right.clickEvents - left.clickEvents);

  return (
    <div className="space-y-7 pb-12">
      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-5">
        <StatCard title="Messages stored" value={String(data.overview.totalMessages)} subtext={`${data.overview.sentMessages} sent, ${data.overview.draftMessages} drafts`} />
        <StatCard title="Click events" value={String(data.overview.clickEvents)} subtext="Clicks are treated as stronger truth than opens." tone="cyan" />
        <StatCard title="Reply events" value={String(data.overview.replyEvents)} subtext="Reply tracking remains the highest-value engagement signal." />
        <StatCard title="Seed avg score" value={String(data.overview.seedAverageScore)} subtext="Average across the most recent recorded seed runs." tone="amber" />
        <StatCard title="Active campaigns" value={String(data.overview.activeCampaigns)} subtext={`${data.overview.reviewMessages} messages still need review.`} />
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.08fr_0.92fr]">
        <Panel title="Identity performance" kicker="Who is carrying the signal">
          <div className="space-y-3">
            {identityRows.map((row) => (
              <article key={row.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{row.label}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{row.address}</p>
                  </div>
                  <StatusPill label={`Score ${row.engagementScore}`} state={scoreState(row.engagementScore)} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-4">
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Sent</div><div className="mt-2 text-white">{row.sentCount}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Opens</div><div className="mt-2 text-white">{row.openEvents}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Clicks</div><div className="mt-2 text-white">{row.clickEvents}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Replies</div><div className="mt-2 text-white">{row.replyEvents}</div></div>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Seed run scoreboard" kicker="Inbox confidence, not guesswork">
          <div className="space-y-3">
            {data.seedRuns.length ? data.seedRuns.map((run) => (
              <article key={run.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{run.subject}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{run.status} · {run.sentAt ? new Date(run.sentAt).toLocaleString() : 'Awaiting send timestamp'}</p>
                  </div>
                  <StatusPill label={`Score ${run.overallScore}`} state={scoreState(run.overallScore)} />
                </div>
                <div className="mt-4 grid gap-3 text-sm text-slate-300/74 sm:grid-cols-3">
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Acceptance</div><div className="mt-2 text-white">{run.acceptanceScore}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Placement</div><div className="mt-2 text-white">{run.placementScore}</div></div>
                  <div><div className="text-[0.62rem] uppercase tracking-[0.24em] text-slate-400">Render</div><div className="mt-2 text-white">{run.renderScore}</div></div>
                </div>
              </article>
            )) : <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300/72">No seed runs recorded yet. Use the seed lab before larger sends.</div>}
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.04fr_0.96fr]">
        <Panel title="Template performance" kicker="Which message blocks pull real response">
          <div className="overflow-x-auto rounded-[24px] border border-white/8 bg-white/[0.025]">
            <table className="min-w-[640px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300/72">
                <tr>
                  <th className="px-4 py-3 font-medium">Template</th>
                  <th className="px-4 py-3 font-medium">Sent</th>
                  <th className="px-4 py-3 font-medium">Opens</th>
                  <th className="px-4 py-3 font-medium">Clicks</th>
                  <th className="px-4 py-3 font-medium">Replies</th>
                </tr>
              </thead>
              <tbody>
                {templateRows.map((row) => (
                  <tr key={row.id} className="border-t border-white/8 text-slate-200/78">
                    <td className="px-4 py-4 align-top"><div className="font-medium text-white">{row.name}</div><div className="mt-1 text-xs text-slate-400">{row.category}</div></td>
                    <td className="px-4 py-4">{row.sentCount}</td>
                    <td className="px-4 py-4">{row.openEvents}</td>
                    <td className="px-4 py-4">{row.clickEvents}</td>
                    <td className="px-4 py-4">{row.replyEvents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Campaign pressure" kicker="Growth surface now uses live data">
          <div className="space-y-3">
            {data.campaigns.length ? data.campaigns.map((campaign) => (
              <article key={campaign.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold text-white">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-slate-300/72">{campaign.objective}</p>
                  </div>
                  <StatusPill label={campaign.status} state={campaign.status === 'live' ? 'healthy' : campaign.status === 'ready' || campaign.status === 'scheduled' ? 'attention' : 'neutral'} />
                </div>
                <div className="mt-4 text-sm leading-6 text-slate-300/74">
                  <div>{campaign.identity}</div>
                  <div>{campaign.templateName ?? 'No template linked yet'}</div>
                </div>
              </article>
            )) : (
              <div className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5 text-sm text-slate-300/72">
                No campaigns yet. Create one in <Link className="text-cyan-200" href="/dashboard/campaigns">Campaigns</Link>.
              </div>
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
