import Panel from '@/components/shell/Panel';
import StatusPill from '@/components/shell/StatusPill';
import { getDashboardShellData } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function DeliverabilityPage() {
  const data = await getDashboardShellData();

  return (
    <div className="grid gap-5 pb-10 xl:grid-cols-[1.05fr_0.95fr]">
      <Panel title="Deliverability lab" kicker="De-risk, do not pretend to prove">
        <div className="space-y-4">
          {data.domains.map((domain) => (
            <article key={domain.domain} className="rounded-[26px] border border-white/8 bg-white/[0.03] p-5">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">{domain.domain}</h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300/72">{domain.notes}</p>
                  {domain.lastCheckedAt ? (
                    <p className="mt-2 text-xs uppercase tracking-[0.22em] text-slate-500">Checked {domain.lastCheckedAt.replace('T', ' ').slice(0, 19)}</p>
                  ) : null}
                </div>
                <div className="text-sm text-slate-300/72">{domain.readiness}</div>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <StatusPill label={`SPF ${domain.spf}`} state={domain.spf === 'pass' ? 'healthy' : domain.spf === 'warn' ? 'attention' : 'critical'} />
                <StatusPill label={`DKIM ${domain.dkim}`} state={domain.dkim === 'pass' ? 'healthy' : domain.dkim === 'warn' ? 'attention' : 'critical'} />
                <StatusPill label={`DMARC ${domain.dmarc}`} state={domain.dmarc === 'pass' ? 'healthy' : domain.dmarc === 'warn' ? 'attention' : 'critical'} />
                <StatusPill label={`MX ${domain.mx}`} state={domain.mx === 'pass' ? 'healthy' : domain.mx === 'warn' ? 'attention' : 'critical'} />
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="Seed matrix" kicker="Real provider inboxes next">
          <div className="space-y-3 text-sm text-slate-300/76">
            {data.seedPreview.map((seed) => (
              <div key={seed.provider} className="grid grid-cols-4 gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] px-4 py-4">
                <div className="font-medium text-white">{seed.provider}</div>
                <div>{seed.accepted}</div>
                <div>{seed.placement}</div>
                <div>{seed.render}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Readiness scoring" kicker="Planned scoring rails">
          <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
            <li>Authentication score: SPF, DKIM, DMARC, MX, sender/provider alignment.</li>
            <li>Structure score: HTML, plain-text, link health, header sanity.</li>
            <li>Seed score: acceptance and placement across Gmail, Outlook, Yahoo, iCloud.</li>
            <li>Operator note: confidence only, never fake guaranteed inboxing.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}
