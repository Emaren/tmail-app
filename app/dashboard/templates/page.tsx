import PlaceholderWorkspace from '@/components/shell/PlaceholderWorkspace';

export default function TemplatesPage() {
  return (
    <PlaceholderWorkspace
      title="Templates and snippets"
      kicker="Reusable composition blocks"
      description="Templates are staged as a first-class workspace. This section will hold founder notes, campaign layouts, signatures, CTA modules, and reusable blocks so composition stays fast without dropping into a generic email-builder mess."
      bullets={[
        'Store HTML/text pairs with identity-aware defaults.',
        'Version founder outreach, support, launch, and follow-up templates.',
        'Track which templates actually earn clicks and replies.',
        'Keep the composer modular instead of rebuilding the same message each time.',
      ]}
      primaryHref="/dashboard/compose"
      primaryLabel="Open compose workbench"
      secondaryHref="/dashboard/messages"
      secondaryLabel="Review recent messages"
    />
  );
}
