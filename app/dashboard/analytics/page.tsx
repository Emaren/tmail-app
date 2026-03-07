import PlaceholderWorkspace from '@/components/shell/PlaceholderWorkspace';

export default function AnalyticsPage() {
  return (
    <PlaceholderWorkspace
      title="Analytics cockpit"
      kicker="Learn what actually works"
      description="Analytics is staged as its own destination so the product can grow into more than a stats card dump. This section will compare identities, links, message styles, send windows, and later campaign or segment performance."
      bullets={[
        'Roll up performance by identity, template, link, and send time.',
        'Separate noisy opens from stronger click and reply signals.',
        'Track deliverability trends alongside engagement trends.',
        'Feed future campaign and contact decisions with real evidence.',
      ]}
      primaryHref="/dashboard"
      primaryLabel="Back to overview"
      secondaryHref="/dashboard/messages"
      secondaryLabel="Inspect message timelines"
    />
  );
}
