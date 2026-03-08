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
  conversions: number;
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
  contacts: MessageContact[];
  providerMessageId?: string | null;
}

export interface MessageContact {
  id: string;
  contactId: string;
  emailAddress: string;
  displayName: string;
  company: string;
  tags: string[];
  contactNotes: string;
  deliveryStatus: string;
  inferredOpenCount: number;
  inferredClickCount: number;
  replyState: string;
  conversionState: string;
  engagementStatus: string;
  notes: string;
  sentAt?: string | null;
  lastOpenedAt?: string | null;
  lastClickedAt?: string | null;
  lastRepliedAt?: string | null;
  lastConvertedAt?: string | null;
  updatedAt: string;
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
  versionCount?: number;
  currentVersion?: number;
}

export interface TemplateVersionSummary {
  id: string;
  templateId: string;
  versionNumber: number;
  name: string;
  category: string;
  description: string;
  subject: string;
  preheader: string;
  htmlBody: string;
  textBody: string;
  isActive: boolean;
  createdAt: string;
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
  acceptedCount: number;
  rejectedCount: number;
  inboxCount: number;
  promotionsCount: number;
  spamCount: number;
  missingCount: number;
  cleanCount: number;
  issuesCount: number;
  acceptanceScore: number;
  placementScore: number;
  renderScore: number;
  overallScore: number;
  scoreState: HealthState;
  createdAt: string;
  updatedAt: string;
  sentAt?: string | null;
}

export interface SeedTestRunDetail extends SeedTestRunSummary {
  results: SeedTestResult[];
}

export interface OperatorSummary {
  id: string;
  username: string;
  displayName: string;
  role: string;
  isActive: boolean;
  totpEnabled: boolean;
  totpPending: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TotpSetupState {
  secret: string;
  otpauthUri: string;
}

export interface AnalyticsOverview {
  totalMessages: number;
  sentMessages: number;
  draftMessages: number;
  reviewMessages: number;
  contactsCount: number;
  openEvents: number;
  clickEvents: number;
  replyEvents: number;
  conversionEvents: number;
  seedAverageScore: number;
  activeCampaigns: number;
}

export interface IdentityPerformance {
  id: string;
  label: string;
  address: string;
  totalMessages: number;
  sentCount: number;
  openEvents: number;
  clickEvents: number;
  replyEvents: number;
  engagementScore: number;
}

export interface TemplatePerformance {
  id: string;
  name: string;
  category: string;
  totalMessages: number;
  sentCount: number;
  openEvents: number;
  clickEvents: number;
  replyEvents: number;
}

export interface SeedRunInsight {
  id: string;
  subject: string;
  status: string;
  overallScore: number;
  acceptanceScore: number;
  placementScore: number;
  renderScore: number;
  sentAt?: string | null;
  updatedAt: string;
}

export interface CampaignSummary {
  id: string;
  name: string;
  objective: string;
  status: string;
  identityId: string;
  identity: string;
  identityLabel: string;
  templateId?: string | null;
  templateName?: string | null;
  audienceLabel: string;
  sendWindow: string;
  notes: string;
  scheduledFor?: string | null;
  messageCount: number;
  sentCount: number;
  openEvents: number;
  clickEvents: number;
  replyEvents: number;
  conversionEvents: number;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  overview: AnalyticsOverview;
  identityPerformance: IdentityPerformance[];
  templatePerformance: TemplatePerformance[];
  seedRuns: SeedRunInsight[];
  campaigns: CampaignSummary[];
  topContacts: ContactSummary[];
}

export interface ContactHistoryItem {
  messageId: string;
  subject: string;
  status: string;
  sendMode: string;
  deliveryStatus: string;
  inferredOpenCount: number;
  inferredClickCount: number;
  replyState: string;
  conversionState: string;
  engagementStatus: string;
  sentAt?: string | null;
  updatedAt: string;
}

export interface ContactSummary {
  id: string;
  emailAddress: string;
  displayName: string;
  company: string;
  tags: string[];
  source: string;
  notes: string;
  messageCount: number;
  sentCount: number;
  openCount: number;
  clickCount: number;
  replyCount: number;
  conversionCount: number;
  engagementScore: number;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
  history?: ContactHistoryItem[];
}
