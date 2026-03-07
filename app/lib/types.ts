export type HealthState = 'healthy' | 'attention' | 'critical';
export type MessageStatus = 'Draft' | 'Queued' | 'Scheduled' | 'Sent' | 'Needs Review';

export interface TopUser {
  id: string;
  count: number;
}

export interface ActivityPoint {
  date: string;
  opens: number;
}

export interface OpenEvent {
  user: string;
  timestamp: string;
}

export interface DashboardOverview {
  totalOpens: number;
  uniqueIds: number;
  mostActive: TopUser | null;
  latestOpen: OpenEvent | null;
  topUsers: TopUser[];
  recentOpens: OpenEvent[];
  activity: ActivityPoint[];
}

export interface MessageSummary {
  id: string;
  subject: string;
  preview: string;
  identity: string;
  status: MessageStatus;
  recipients: number;
  sentAt: string;
  opens: number;
  clicks: number;
  replies: number;
  notes: string;
  sendMode?: string;
}

export interface IdentitySummary {
  id: string;
  label: string;
  address: string;
  provider: string;
  health: HealthState;
  displayName?: string;
  replyTo?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUsername?: string;
  providerType?: string;
  useTls?: boolean;
  lastSend: string;
  clickRate: string;
  replyRate: string;
  tracking: string;
  notes?: string;
  smtpSecretEnv?: string;
  secretConfigured?: boolean;
}

export interface DomainHealth {
  domain: string;
  spf: 'pass' | 'warn' | 'fail';
  dkim: 'pass' | 'warn' | 'fail';
  dmarc: 'pass' | 'warn' | 'fail';
  mx: 'pass' | 'warn' | 'fail';
  readiness: string;
  notes: string;
  lastCheckedAt?: string;
}

export interface AlertItem {
  id: string;
  level: 'info' | 'warning' | 'critical';
  title: string;
  body: string;
}

export interface SeedPreview {
  provider: string;
  accepted: string;
  placement: string;
  render: string;
}

export interface MessageEvent {
  id: string;
  type: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}

export interface TrackedLink {
  token: string;
  url: string;
  label?: string | null;
  createdAt: string;
}

export interface MessageDetail extends MessageSummary {
  preheader: string;
  htmlBody: string;
  textBody: string;
  trackedLinks: TrackedLink[];
  events: MessageEvent[];
  recipientsList: string[];
  providerMessageId?: string | null;
}

export interface DashboardShellData {
  overview: DashboardOverview;
  messages: MessageSummary[];
  identities: IdentitySummary[];
  domains: DomainHealth[];
  alerts: AlertItem[];
  seedPreview: SeedPreview[];
}

export interface TemplateSummary {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeedInboxSummary {
  id: string;
  provider: string;
  label: string;
  emailAddress: string;
  notes: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SeedTestResult {
  id: string;
  seedInboxId: string;
  provider: string;
  label: string;
  emailAddress: string;
  accepted: boolean | null;
  placement: string;
  renderStatus: string;
  notes: string;
  checkedAt?: string | null;
  updatedAt: string;
}

export interface SeedTestRunSummary {
  id: string;
  identityId: string;
  identity: string;
  identityLabel: string;
  messageId?: string | null;
  templateId?: string | null;
  subject: string;
  status: string;
  summary: string;
  resultCount: number;
  completedCount: number;
  inboxCount: number;
  spamCount: number;
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
}

export interface SeedTestRunDetail extends SeedTestRunSummary {
  results: SeedTestResult[];
}
