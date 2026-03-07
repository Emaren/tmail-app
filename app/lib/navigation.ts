export type NavState = 'live' | 'staged';
export type NavIconName =
  | 'overview'
  | 'compose'
  | 'messages'
  | 'identities'
  | 'deliverability'
  | 'seed-tests'
  | 'templates'
  | 'campaigns'
  | 'contacts'
  | 'analytics'
  | 'settings';

export interface NavItem {
  href: string;
  label: string;
  description: string;
  section: string;
  state: NavState;
  icon: NavIconName;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    title: 'Command',
    items: [
      {
        href: '/dashboard',
        label: 'Overview',
        description: 'Top-line performance, readiness, and the current message queue.',
        section: 'Command',
        state: 'live',
        icon: 'overview',
      },
      {
        href: '/dashboard/compose',
        label: 'Compose',
        description: 'Draft, instrument, and send through the active Apple rails.',
        section: 'Command',
        state: 'live',
        icon: 'compose',
      },
      {
        href: '/dashboard/messages',
        label: 'Messages',
        description: 'Inspect event timelines, tracked links, and send outcomes.',
        section: 'Command',
        state: 'live',
        icon: 'messages',
      },
    ],
  },
  {
    title: 'Infrastructure',
    items: [
      {
        href: '/dashboard/identities',
        label: 'Identities',
        description: 'Manage sender rails, SMTP auth, and tracking defaults.',
        section: 'Infrastructure',
        state: 'live',
        icon: 'identities',
      },
      {
        href: '/dashboard/deliverability',
        label: 'Deliverability',
        description: 'Check DNS posture, auth health, and readiness signals.',
        section: 'Infrastructure',
        state: 'live',
        icon: 'deliverability',
      },
      {
        href: '/dashboard/seed-tests',
        label: 'Seed Tests',
        description: 'Run real inbox placement checks across provider seed accounts.',
        section: 'Infrastructure',
        state: 'live',
        icon: 'seed-tests',
      },
    ],
  },
  {
    title: 'Growth',
    items: [
      {
        href: '/dashboard/templates',
        label: 'Templates',
        description: 'Reusable layouts, snippets, and founder-style message blocks.',
        section: 'Growth',
        state: 'live',
        icon: 'templates',
      },
      {
        href: '/dashboard/campaigns',
        label: 'Campaigns',
        description: 'Sequences, batch sends, and follow-up logic across identities.',
        section: 'Growth',
        state: 'staged',
        icon: 'campaigns',
      },
      {
        href: '/dashboard/contacts',
        label: 'Contacts',
        description: 'Light CRM records, segments, and engagement context.',
        section: 'Growth',
        state: 'staged',
        icon: 'contacts',
      },
      {
        href: '/dashboard/analytics',
        label: 'Analytics',
        description: 'Cross-message performance, link stats, and operator learnings.',
        section: 'Growth',
        state: 'staged',
        icon: 'analytics',
      },
    ],
  },
  {
    title: 'Control',
    items: [
      {
        href: '/dashboard/settings',
        label: 'Settings',
        description: 'Environment defaults, operating rules, and next backend milestones.',
        section: 'Control',
        state: 'live',
        icon: 'settings',
      },
    ],
  },
];

export const navigationItems = navigationSections.flatMap((section) => section.items);

export function resolveNavItem(pathname: string): NavItem {
  const exact = navigationItems.find((item) => item.href === pathname);
  if (exact) {
    return exact;
  }

  const nested = navigationItems.find((item) => pathname.startsWith(`${item.href}/`));
  return nested ?? navigationItems[0];
}
