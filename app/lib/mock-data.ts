import {
  AlertItem,
  DashboardOverview,
  DomainHealth,
  IdentitySummary,
  MessageSummary,
  SeedPreview,
} from '@/lib/types';

export const mockOverview: DashboardOverview = {
  totalOpens: 305,
  uniqueIds: 11,
  mostActive: { id: 'tony_public', count: 135 },
  latestOpen: { user: 'tony_local', timestamp: '2025-08-06T15:45:07' },
  topUsers: [
    { id: 'tony_public', count: 135 },
    { id: 'tony_local', count: 113 },
    { id: 'tony_localhost', count: 36 },
    { id: 'test', count: 10 },
    { id: 'hidden_click', count: 4 },
  ],
  recentOpens: [
    { user: 'tony_local', timestamp: '2025-08-06T15:45:07' },
    { user: 'tony_public', timestamp: '2025-08-06T15:45:07' },
    { user: 'hidden_click', timestamp: '2025-08-06T15:45:06' },
    { user: 'tony_local', timestamp: '2025-08-06T14:49:21' },
    { user: 'tony_public', timestamp: '2025-08-06T14:49:21' },
  ],
  activity: [
    { date: 'Aug 01', opens: 4 },
    { date: 'Aug 02', opens: 7 },
    { date: 'Aug 03', opens: 19 },
    { date: 'Aug 04', opens: 41 },
    { date: 'Aug 05', opens: 88 },
    { date: 'Aug 06', opens: 146 },
    { date: 'Today', opens: 0 },
  ],
};

export const mockMessages: MessageSummary[] = [
  {
    id: 'msg-launch-proof',
    subject: 'TokenTap launch note with tracked CTA',
    preview: 'Founder-style launch email with plain-text fallback and branded CTA block.',
    identity: 'tonyblum@me.com',
    status: 'Sent',
    recipients: 24,
    sentAt: '2026-03-07T09:15:00-07:00',
    opens: 18,
    clicks: 12,
    replies: 2,
    notes: 'Good benchmark for future Apple SMTP templates.',
  },
  {
    id: 'msg-ws-seed',
    subject: 'Wheat & Stone proof suite seed test',
    preview: 'Pre-send validation run aimed at Gmail, Outlook, Yahoo, and iCloud seeds.',
    identity: 'info@wheatandstone.ca',
    status: 'Needs Review',
    recipients: 8,
    sentAt: '2026-03-07T08:25:00-07:00',
    opens: 0,
    clicks: 0,
    replies: 0,
    notes: 'Blocked on automated inbox placement capture.',
  },
  {
    id: 'msg-pulse-bridge',
    subject: 'Pulse campaign teaser with follow-up ladder',
    preview: 'Draft sequence concept that will eventually sync with Pulse social launches.',
    identity: 'info@wheatandstone.ca',
    status: 'Draft',
    recipients: 0,
    sentAt: '2026-03-06T16:40:00-07:00',
    opens: 0,
    clicks: 0,
    replies: 0,
    notes: 'Good candidate for campaign engine milestone.',
  },
];

export const mockIdentities: IdentitySummary[] = [
  {
    id: 'tony-me',
    label: 'Founder Rail',
    address: 'tonyblum@me.com',
    provider: 'Apple SMTP',
    health: 'healthy',
    lastSend: '2026-03-07 09:15',
    clickRate: '18.2%',
    replyRate: '4.1%',
    tracking: 'Soft opens + tracked links',
  },
  {
    id: 'ws-info',
    label: 'Brand Rail',
    address: 'info@wheatandstone.ca',
    provider: 'Apple Custom Domain',
    health: 'attention',
    lastSend: '2026-03-07 08:25',
    clickRate: 'Pending',
    replyRate: 'Pending',
    tracking: 'Ready for seed suite',
  },
];

export const mockDomainHealth: DomainHealth[] = [
  {
    domain: 'me.com',
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'pass',
    mx: 'pass',
    readiness: 'High confidence for founder-style sends',
    notes: 'Apple-hosted identity. Keep content lean and personal.',
  },
  {
    domain: 'wheatandstone.ca',
    spf: 'pass',
    dkim: 'pass',
    dmarc: 'warn',
    mx: 'pass',
    readiness: 'Good rail, but seed inbox suite should be part of every checkpoint',
    notes: 'Custom-domain alignment needs ongoing verification before campaigns.',
  },
];

export const mockAlerts: AlertItem[] = [
  {
    id: 'alert-api-contract',
    level: 'warning',
    title: 'Analytics contract still thin',
    body: 'Dashboard shell is ahead of the API model. Messages, identities, and deliverability will move into persistent storage next.',
  },
  {
    id: 'alert-seeds',
    level: 'info',
    title: 'Seed inbox lab not wired yet',
    body: 'The UI now reserves space for real provider seeds. Gmail, Outlook, Yahoo, and iCloud accounts should back the next phase.',
  },
];

export const mockSeedPreview: SeedPreview[] = [
  { provider: 'Gmail', accepted: 'Yes', placement: 'Inbox', render: 'Clean' },
  { provider: 'Outlook', accepted: 'Yes', placement: 'Pending', render: 'Pending' },
  { provider: 'Yahoo', accepted: 'Planned', placement: 'Planned', render: 'Planned' },
  { provider: 'iCloud', accepted: 'Planned', placement: 'Planned', render: 'Planned' },
];
