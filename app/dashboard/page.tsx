import Link from 'next/link';
import ChartCard from '@/components/dashboard/ChartCard';
import OpensActivityChart from '@/components/dashboard/OpensActivityChart';
import OpensPerUserChart from '@/components/dashboard/OpensPerUserChart';
import StatCard from '@/components/dashboard/StatCard';
import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { getDashboardShellData } from '@/lib/api';
import { navigationItems } from '@/lib/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const data = await getDashboardShellData();

  return (
    <div className="space-y-5 pb-12">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total opens" value={String(data.overview.totalOpens)} subtext="Soft signal only. Treat clicks and replies as stronger truth." tone="cyan" />
        <StatCard title="Unique IDs" value={String(data.overview.uniqueIds)} subtext="Current tracker history across the active dataset." />
        <StatCard title="Most active identity" value={data.overview.mostActive?.id ?? 'Pending'} subtext={`${data.overview.mostActive?.count ?? 0} logged events`} />
        <StatCard title="Latest open" value={data.overview.latestOpen?.user ?? 'Pending'} subtext={data.overview.latestOpen?.timestamp ?? 'No live signal yet'} tone="amber" />
      </section>

      <Panel title="Castle map" kicker="Every section is routed">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[24px] border border-white/8 bg-white/[0.03] px-4 py-4 transition hover:border-cyan-200/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="text-base font-semibold text-white">{item.label}</div>
                <StatusPill label={item.state === 'live' ? 'Live' : 'Staged'} state={item.state === 'live' ? 'healthy' : 'neutral'} />
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-300/72">{item.description}</p>
            </Link>
          ))}
        </div>
      </Panel>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <ChartCard title="Open activity" kicker="Signal history">
          <OpensActivityChart data={data.overview.activity} />
        </ChartCard>
        <ChartCard title="Top tracked IDs" kicker="Normalized analytics contract">
          <OpensPerUserChart data={data.overview.topUsers} />
        </ChartCard>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Recent messages" kicker="Checkpoint queue">
          <div className="space-y-4">
            {data.messages.map((message) => (
              <Link
                key={message.id}
                href={`/dashboard/messages/${message.id}`}
                className="block rounded-[24px] border border-white/8 bg-white/[0.03] p-5 transition hover:border-cyan-200/20 hover:bg-white/[0.05]"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill label={message.status} state={message.status === 'Needs Review' ? 'attention' : message.status === 'Draft' ? 'neutral' : 'healthy'} />
                      <span className="text-xs uppercase tracking-[0.24em] text-slate-400">{message.identity}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                    <p className="max-w-2xl text-sm leading-6 text-slate-300/72">{message.preview}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-left text-sm text-slate-300/72 sm:grid-cols-4 md:text-right">
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Recipients</div>
                      <div className="mt-2 text-base text-white">{message.recipients}</div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Opens</div>
                      <div className="mt-2 text-base text-white">{message.opens}</div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Clicks</div>
                      <div className="mt-2 text-base text-white">{message.clicks}</div>
                    </div>
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-[0.24em] text-slate-400">Replies</div>
                      <div className="mt-2 text-base text-white">{message.replies}</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>

        <div className="space-y-5">
          <Panel title="Identity health" kicker="Trusted rails">
            <div className="space-y-4">
              {data.identities.map((identity) => (
                <div key={identity.id} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] uppercase tracking-[0.28em] text-cyan-200/65">{identity.label}</p>
                      <h3 className="mt-2 text-lg font-semibold text-white">{identity.address}</h3>
                      <p className="mt-1 text-sm text-slate-300/68">{identity.provider}</p>
                    </div>
                    <StatusPill label={identity.health} state={identity.health} />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-slate-300/72 sm:grid-cols-2">
                    <div>
                      <div className="text-[0.64rem] uppercase tracking-[0.2em] text-slate-400">Credential state</div>
                      <div className="mt-2 text-white">{identity.lastSend}</div>
                    </div>
                    <div>
                      <div className="text-[0.64rem] uppercase tracking-[0.2em] text-slate-400">Tracking</div>
                      <div className="mt-2 text-white">{identity.tracking}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel title="Alerts rail" kicker="Product truth">
            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div key={alert.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-3">
                    <StatusPill label={alert.level} state={alert.level === 'warning' ? 'attention' : alert.level === 'critical' ? 'critical' : 'neutral'} />
                    <h3 className="text-sm font-semibold text-white">{alert.title}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-300/72">{alert.body}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Deliverability posture" kicker="Domains and readiness">
          <div className="overflow-x-auto rounded-[24px] border border-white/8">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-slate-300/70">
                <tr>
                  <th className="px-4 py-3 font-medium">Domain</th>
                  <th className="px-4 py-3 font-medium">SPF</th>
                  <th className="px-4 py-3 font-medium">DKIM</th>
                  <th className="px-4 py-3 font-medium">DMARC</th>
                  <th className="px-4 py-3 font-medium">MX</th>
                </tr>
              </thead>
              <tbody>
                {data.domains.map((domain) => (
                  <tr key={domain.domain} className="border-t border-white/8 text-slate-200/78">
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium text-white">{domain.domain}</div>
                      <div className="mt-1 max-w-md text-xs leading-5 text-slate-400">{domain.readiness}</div>
                    </td>
                    <td className="px-4 py-4"><StatusPill label={domain.spf} state={domain.spf === 'pass' ? 'healthy' : domain.spf === 'warn' ? 'attention' : 'critical'} /></td>
                    <td className="px-4 py-4"><StatusPill label={domain.dkim} state={domain.dkim === 'pass' ? 'healthy' : domain.dkim === 'warn' ? 'attention' : 'critical'} /></td>
                    <td className="px-4 py-4"><StatusPill label={domain.dmarc} state={domain.dmarc === 'pass' ? 'healthy' : domain.dmarc === 'warn' ? 'attention' : 'critical'} /></td>
                    <td className="px-4 py-4"><StatusPill label={domain.mx} state={domain.mx === 'pass' ? 'healthy' : domain.mx === 'warn' ? 'attention' : 'critical'} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Seed lab preview" kicker="Real inboxes, not simulation">
          <div className="space-y-3">
            {data.seedPreview.map((seed) => (
              <div
                key={seed.provider}
                className="grid gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4 text-sm text-slate-300/75 sm:grid-cols-[1.2fr_repeat(3,1fr)]"
              >
                <div className="font-medium text-white">{seed.provider}</div>
                <div><span className="text-slate-400 sm:hidden">Accepted: </span>{seed.accepted}</div>
                <div><span className="text-slate-400 sm:hidden">Placement: </span>{seed.placement}</div>
                <div><span className="text-slate-400 sm:hidden">Render: </span>{seed.render}</div>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}
