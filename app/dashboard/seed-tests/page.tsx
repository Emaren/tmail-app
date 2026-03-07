import PlaceholderWorkspace from '@/components/shell/PlaceholderWorkspace';

export default function SeedTestsPage() {
  return (
    <PlaceholderWorkspace
      title="Seed test matrix"
      kicker="Real inboxes, not simulation"
      description="This is the future home for Gmail, Outlook, Yahoo, iCloud, and custom seed inbox runs. The route is live now so the navigation map is complete, and the shell is ready for the actual provider matrix, inbox placement capture, and render verification."
      bullets={[
        'Run batch seed sends before meaningful production messages.',
        'Record acceptance, inbox/promotions/spam placement, render health, and latency.',
        'Surface confidence scores without pretending to guarantee inboxing.',
        'Tie results back to identities, templates, and campaign steps.',
      ]}
      primaryHref="/dashboard/deliverability"
      primaryLabel="Open deliverability lab"
      secondaryHref="/dashboard/compose"
      secondaryLabel="Send a test message"
    />
  );
}
