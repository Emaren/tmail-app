import Panel from '@/components/shell/Panel';

export default function SettingsPage() {
  return (
    <div className="grid gap-5 xl:grid-cols-2 pb-10">
      <Panel title="Operating rules" kicker="Local-first workflow">
        <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
          <li>Build locally, checkpoint deliberately, then deploy by git pull on the VPS.</li>
          <li>Keep SMTP credentials in environment-backed config only.</li>
          <li>Use seed inbox runs before any meaningful production send.</li>
          <li>Keep open tracking labeled as a soft signal in both API and UI.</li>
        </ul>
      </Panel>

      <Panel title="Next backend milestones" kicker="What the API must grow into">
        <ul className="space-y-3 text-sm leading-6 text-slate-300/74">
          <li>Identity persistence and secure provider credential handling.</li>
          <li>Message store with per-recipient event timeline.</li>
          <li>Tracked click redirect endpoint and message-scoped instrumentation.</li>
          <li>Deliverability diagnostics and seed test orchestration endpoints.</li>
        </ul>
      </Panel>

      <Panel title="Apple SMTP rail" kicker="Phase 1 send foundation">
        <div className="space-y-3 text-sm leading-6 text-slate-300/74">
          <p>Primary identities for the current build track:</p>
          <p>tonyblum@me.com</p>
          <p>info@wheatandstone.ca</p>
          <p>The provider abstraction and secure settings screens will be wired before live multi-identity sending is turned on.</p>
        </div>
      </Panel>

      <Panel title="Future surface area" kicker="Built to expand">
        <div className="space-y-3 text-sm leading-6 text-slate-300/74">
          <p>Templates, campaigns, contacts, analytics, and Pulse coordination are intentionally absent from the sidebar for now.</p>
          <p>The route shell and component model were set up so they can be added without redesigning the app frame.</p>
        </div>
      </Panel>
    </div>
  );
}
