import PlaceholderWorkspace from '@/components/shell/PlaceholderWorkspace';

export default function ContactsPage() {
  return (
    <PlaceholderWorkspace
      title="Contacts and segments"
      kicker="Light CRM layer"
      description="Contacts are staged so TMail can grow into reply-aware campaigns instead of staying as a raw tracker. This area will hold recipient history, segments, engagement summaries, and targeting primitives for future send logic."
      bullets={[
        'Keep identity history per contact so outreach stays contextual.',
        'Segment by clicks, replies, inactivity, or source.',
        'Support imports without forcing a full CRM clone.',
        'Make campaign targeting explicit and auditable.',
      ]}
      primaryHref="/dashboard/messages"
      primaryLabel="Inspect message history"
      secondaryHref="/dashboard/campaigns"
      secondaryLabel="Open campaign staging"
    />
  );
}
