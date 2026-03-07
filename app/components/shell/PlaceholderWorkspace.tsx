import Link from 'next/link';
import Panel from '@/components/shell/Panel';

interface PlaceholderWorkspaceProps {
  title: string;
  kicker: string;
  description: string;
  bullets: string[];
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
}

export default function PlaceholderWorkspace({
  title,
  kicker,
  description,
  bullets,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
}: PlaceholderWorkspaceProps) {
  return (
    <div className="grid gap-6 pb-12 2xl:grid-cols-[1.15fr_0.85fr]">
      <Panel title={title} kicker={kicker}>
        <div className="space-y-8">
          <p className="max-w-3xl text-sm leading-7 text-slate-300/76 sm:text-base">{description}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            {bullets.map((bullet) => (
              <article
                key={bullet}
                className="rounded-[24px] border border-white/8 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              >
                <p className="text-sm leading-7 text-slate-200/78">{bullet}</p>
              </article>
            ))}
          </div>
        </div>
      </Panel>

      <div className="space-y-6">
        <Panel title="Next operator move" kicker="Keep the build navigable">
          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-1">
            <Link
              href={primaryHref}
              className="block rounded-[22px] border border-cyan-300/22 bg-cyan-300/12 px-5 py-4 text-sm font-medium text-white transition hover:bg-cyan-300/16"
            >
              {primaryLabel}
            </Link>
            <Link
              href={secondaryHref}
              className="block rounded-[22px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm font-medium text-white transition hover:bg-white/[0.07]"
            >
              {secondaryLabel}
            </Link>
          </div>
        </Panel>

        <Panel title="Shipping posture" kicker="Route is live, feature is staged">
          <div className="space-y-4 text-sm leading-6 text-slate-300/74">
            <div className="rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-4">
              The route is already in the permanent nav, so the product map is stable while the internals deepen.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-4">
              The shell is ready for real backend wiring without redesigning the app frame later.
            </div>
            <div className="rounded-[22px] border border-white/8 bg-white/[0.035] px-4 py-4">
              Build order remains local-first, then Git push, then checkpoint deploy to the VPS.
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}
