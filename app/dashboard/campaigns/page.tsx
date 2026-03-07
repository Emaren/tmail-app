import PlaceholderWorkspace from '@/components/shell/PlaceholderWorkspace';

export default function CampaignsPage() {
  return (
    <PlaceholderWorkspace
      title="Campaign engine"
      kicker="Sequences and launches"
      description="Campaigns are now part of the permanent shell. This surface will become the control room for scheduled sends, follow-up ladders, stop conditions, and eventually the email bridge into Pulse-led launches."
      bullets={[
        'One-off sends, scheduled drops, and sequence steps belong here.',
        'Stop rules should react to clicks, replies, or conversions.',
        'Campaign analytics should roll up identity, template, and timing performance.',
        'This route is staged now so the product map stays honest and complete.',
      ]}
      primaryHref="/dashboard/analytics"
      primaryLabel="Open analytics surface"
      secondaryHref="/dashboard/templates"
      secondaryLabel="Review template staging"
    />
  );
}
