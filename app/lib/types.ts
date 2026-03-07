export type HealthState = 'healthy' | 'attention' | 'critical';

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
  status: 'Draft' | 'Scheduled' | 'Sent' | 'Needs Review';
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
