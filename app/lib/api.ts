import { fetchServerJson } from '@/lib/server-api';
import {
  mockAlerts,
  mockDomainHealth,
  mockIdentities,
  mockMessages,
  mockOverview,
  mockSeedInboxes,
  mockSeedPreview,
  mockSeedRuns,
  mockTemplates,
} from '@/lib/mock-data';
import {
  AlertItem,
  AnalyticsSummary,
  CampaignSummary,
  CampaignRunSummary,
  ContactHistoryItem,
  ContactSummary,
  DashboardOverview,
  DashboardShellData,
  DomainHealth,
  IdentityPerformance,
  IdentitySummary,
  MessageDetail,
  MessageContact,
  MessageStatus,
  MessageSummary,
  OpenEvent,
  OperatorSummary,
  SeedRunInsight,
  SeedInboxSummary,
  SeedPreview,
  SeedTestResult,
  SeedTestRunDetail,
  SeedTestRunSummary,
  TemplatePerformance,
  TemplateSummary,
  TemplateVersionSummary,
  TopUser,
  TotpSetupState,
  TrackedLink,
} from '@/lib/types';

const CLIENT_API_BASE = '/api/proxy';

interface StatsResponse {
  total_opens?: number;
  unique_ids?: number;
  most_active?: { user?: string; count?: number } | null;
  latest_open?: { user?: string; timestamp?: string } | null;
  top_users?: Array<TopUser | [string, number]>;
  log?: Array<{ user?: string; timestamp?: string }>;
  opens_over_time?: Array<{ date?: string; opens?: number }>;
}

interface IdentityResponse {
  id: string;
  label?: string;
  display_name?: string;
  email_address?: string;
  provider_type?: string;
  smtp_host?: string;
  smtp_port?: number;
  smtp_username?: string;
  reply_to?: string;
  use_tls?: boolean;
  notes?: string;
  smtp_secret_env?: string;
  tracking_enabled?: boolean;
  pixel_enabled?: boolean;
  health?: { secretConfigured?: boolean; status?: 'healthy' | 'attention' | 'critical' };
}

interface MessageResponse {
  id: string;
  subject?: string;
  preview?: string;
  identity?: string;
  status?: MessageStatus;
  recipient_count?: number;
  sent_at?: string | null;
  created_at?: string;
  opens?: number;
  clicks?: number;
  replies?: number;
  conversions?: number;
  error_message?: string | null;
  send_mode?: string;
  preheader?: string;
  html_body?: string;
  text_body?: string;
  recipients?: string[];
  provider_message_id?: string | null;
  tracked_links?: Array<{ token?: string; url?: string; label?: string | null; created_at?: string }>;
  contacts?: Array<{
    id?: string;
    contact_id?: string;
    email_address?: string;
    display_name?: string;
    company?: string;
    tags?: string[];
    contact_notes?: string;
    delivery_status?: string;
    inferred_open_count?: number;
    inferred_click_count?: number;
    reply_state?: string;
    conversion_state?: string;
    engagement_status?: string;
    notes?: string;
    sent_at?: string | null;
    last_opened_at?: string | null;
    last_clicked_at?: string | null;
    last_replied_at?: string | null;
    last_converted_at?: string | null;
    updated_at?: string;
  }>;
  events?: Array<{ id?: string; type?: string; occurred_at?: string; payload?: Record<string, unknown> }>;
}

interface TemplateResponse {
  id: string;
  name?: string;
  slug?: string;
  category?: string;
  description?: string;
  subject?: string;
  preheader?: string;
  html_body?: string;
  text_body?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  version_count?: number;
  current_version?: number;
}

interface TemplateVersionResponse {
  id: string;
  template_id?: string;
  version_number?: number;
  name?: string;
  category?: string;
  description?: string;
  subject?: string;
  preheader?: string;
  html_body?: string;
  text_body?: string;
  is_active?: boolean;
  created_at?: string;
}

interface SeedInboxResponse {
  id: string;
  provider?: string;
  label?: string;
  email_address?: string;
  notes?: string;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SeedResultResponse {
  id?: string;
  seed_inbox_id?: string;
  provider?: string;
  label?: string;
  email_address?: string;
  accepted?: boolean | null;
  placement?: string;
  render_status?: string;
  notes?: string;
  checked_at?: string | null;
  updated_at?: string;
}

interface SeedRunResponse {
  id: string;
  identity_id?: string;
  identity?: string;
  identity_label?: string;
  message_id?: string | null;
  template_id?: string | null;
  subject?: string;
  status?: string;
  summary?: string;
  result_count?: number;
  completed_count?: number;
  accepted_count?: number;
  rejected_count?: number;
  inbox_count?: number;
  promotions_count?: number;
  spam_count?: number;
  missing_count?: number;
  clean_count?: number;
  issues_count?: number;
  acceptance_score?: number;
  placement_score?: number;
  render_score?: number;
  overall_score?: number;
  score_state?: 'healthy' | 'attention' | 'critical';
  created_at?: string;
  updated_at?: string;
  sent_at?: string | null;
  results?: SeedResultResponse[];
}

interface OperatorResponse {
  id: string;
  username?: string;
  display_name?: string;
  role?: string;
  is_active?: boolean;
  totp_enabled?: boolean;
  totp_pending?: boolean;
  last_login_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface CampaignResponse {
  id: string;
  name?: string;
  objective?: string;
  status?: string;
  identity_id?: string;
  identity?: string;
  identity_label?: string;
  template_id?: string | null;
  template_name?: string | null;
  audience_label?: string;
  audience_emails?: string;
  audience_count?: number;
  send_window?: string;
  notes?: string;
  scheduled_for?: string | null;
  message_count?: number;
  sent_count?: number;
  open_events?: number;
  click_events?: number;
  reply_events?: number;
  conversion_events?: number;
  last_run?: CampaignRunResponse | null;
  recent_runs?: CampaignRunResponse[];
  created_at?: string;
  updated_at?: string;
}

interface CampaignRunResponse {
  id: string;
  campaign_id?: string;
  message_id?: string | null;
  mode?: string;
  trigger_type?: string;
  status?: string;
  recipient_count?: number;
  sent_count?: number;
  summary?: string;
  started_at?: string;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface ContactResponse {
  id: string;
  email_address?: string;
  display_name?: string;
  company?: string;
  tags?: string[];
  source?: string;
  notes?: string;
  message_count?: number;
  sent_count?: number;
  open_count?: number;
  click_count?: number;
  reply_count?: number;
  conversion_count?: number;
  engagement_score?: number;
  last_activity_at?: string | null;
  created_at?: string;
  updated_at?: string;
  history?: Array<{
    message_id?: string;
    subject?: string;
    status?: string;
    send_mode?: string;
    delivery_status?: string;
    inferred_open_count?: number;
    inferred_click_count?: number;
    reply_state?: string;
    conversion_state?: string;
    engagement_status?: string;
    sent_at?: string | null;
    updated_at?: string;
  }>;
}

interface AnalyticsSummaryResponse {
  overview?: {
    total_messages?: number;
    sent_messages?: number;
    draft_messages?: number;
    review_messages?: number;
    contacts_count?: number;
    open_events?: number;
    click_events?: number;
    reply_events?: number;
    conversion_events?: number;
    seed_average_score?: number;
    active_campaigns?: number;
  } | null;
  identity_performance?: Array<{
    id?: string;
    label?: string;
    address?: string;
    total_messages?: number;
    sent_count?: number;
    open_events?: number;
    click_events?: number;
    reply_events?: number;
    engagement_score?: number;
  }>;
  template_performance?: Array<{
    id?: string;
    name?: string;
    category?: string;
    total_messages?: number;
    sent_count?: number;
    open_events?: number;
    click_events?: number;
    reply_events?: number;
  }>;
  seed_runs?: Array<{
    id?: string;
    subject?: string;
    status?: string;
    overall_score?: number;
    acceptance_score?: number;
    placement_score?: number;
    render_score?: number;
    sent_at?: string | null;
    updated_at?: string;
  }>;
  campaigns?: CampaignResponse[];
  top_contacts?: ContactResponse[];
}

interface DashboardSummaryResponse {
  overview?: StatsResponse | null;
  messages?: MessageResponse[];
  identities?: IdentityResponse[];
  domains?: Array<{
    domain?: string;
    spf?: 'pass' | 'warn' | 'fail';
    dkim?: 'pass' | 'warn' | 'fail';
    dmarc?: 'pass' | 'warn' | 'fail';
    mx?: 'pass' | 'warn' | 'fail';
    readiness?: string;
    notes?: string;
    last_checked_at?: string;
  }>;
  alerts?: AlertItem[];
  seed_preview?: Array<{ provider?: string; accepted?: string; placement?: string; render?: string }>;
}

function normalizeTopUsers(topUsers: StatsResponse['top_users']): TopUser[] {
  if (!Array.isArray(topUsers)) {
    return [];
  }

  return topUsers.flatMap((item) => {
    if (Array.isArray(item) && item.length === 2) {
      const [id, count] = item;
      return typeof id === 'string' && typeof count === 'number' ? [{ id, count }] : [];
    }

    if (
      item &&
      typeof item === 'object' &&
      'id' in item &&
      'count' in item &&
      typeof item.id === 'string' &&
      typeof item.count === 'number'
    ) {
      return [{ id: item.id, count: item.count }];
    }

    return [];
  });
}

function normalizeOverview(payload?: StatsResponse | null): DashboardOverview {
  if (!payload) {
    return mockOverview;
  }

  const topUsers = normalizeTopUsers(payload.top_users);
  const recentOpens: OpenEvent[] = Array.isArray(payload.log)
    ? payload.log.flatMap((entry) => (entry.user && entry.timestamp ? [{ user: entry.user, timestamp: entry.timestamp }] : []))
    : [];

  const activity = Array.isArray(payload.opens_over_time)
    ? payload.opens_over_time.flatMap((point) =>
        point.date && typeof point.opens === 'number' ? [{ date: point.date, opens: point.opens }] : [],
      )
    : [];

  return {
    totalOpens: payload.total_opens ?? mockOverview.totalOpens,
    uniqueIds: payload.unique_ids ?? mockOverview.uniqueIds,
    mostActive: payload.most_active?.user
      ? { id: payload.most_active.user, count: payload.most_active.count ?? 0 }
      : mockOverview.mostActive,
    latestOpen: payload.latest_open?.user && payload.latest_open?.timestamp
      ? { user: payload.latest_open.user, timestamp: payload.latest_open.timestamp }
      : mockOverview.latestOpen,
    topUsers: topUsers.length ? topUsers : mockOverview.topUsers,
    recentOpens: recentOpens.length ? recentOpens : mockOverview.recentOpens,
    activity: activity.length ? activity : mockOverview.activity,
  };
}

function normalizeIdentity(item: IdentityResponse): IdentitySummary {
  const secretConfigured = Boolean(item.health?.secretConfigured);
  return {
    id: item.id,
    label: item.label ?? 'Identity',
    address: item.email_address ?? 'unknown@local',
    provider: item.provider_type === 'apple_smtp' ? 'Apple SMTP' : item.provider_type ?? 'Custom SMTP',
    health: item.health?.status ?? 'attention',
    displayName: item.display_name ?? item.label ?? 'Identity',
    replyTo: item.reply_to ?? item.email_address ?? '',
    smtpHost: item.smtp_host ?? 'smtp.mail.me.com',
    smtpPort: item.smtp_port ?? 587,
    smtpUsername: item.smtp_username ?? item.email_address ?? '',
    providerType: item.provider_type ?? 'apple_smtp',
    useTls: item.use_tls ?? true,
    lastSend: secretConfigured ? 'Ready for connection test' : 'Credential env missing',
    clickRate: 'Pending',
    replyRate: 'Pending',
    tracking: item.tracking_enabled === false ? 'Tracking off' : item.pixel_enabled === false ? 'Links only' : 'Links + soft opens',
    notes: item.notes,
    smtpSecretEnv: item.smtp_secret_env,
    secretConfigured,
  };
}

function normalizeMessage(item: MessageResponse): MessageSummary {
  return {
    id: item.id,
    subject: item.subject ?? 'Untitled message',
    preview: item.preview ?? 'No preview available yet.',
    identity: item.identity ?? 'unknown',
    status: item.status ?? 'Draft',
    recipients: item.recipient_count ?? 0,
    sentAt: item.sent_at ?? item.created_at ?? new Date().toISOString(),
    opens: item.opens ?? 0,
    clicks: item.clicks ?? 0,
    replies: item.replies ?? 0,
    conversions: item.conversions ?? 0,
    notes: item.error_message ?? item.preview ?? 'No notes.',
    sendMode: item.send_mode,
  };
}

function buildMockMessageDetail(messageId: string): MessageDetail | null {
  const found = mockMessages.find((entry) => entry.id === messageId);
  if (!found) {
    return null;
  }

  return {
    ...found,
    preheader: 'Compose in TMail. Validate in TMail. Send through Apple.',
    htmlBody: `<p>${found.preview}</p>`,
    textBody: found.preview,
    recipientsList: [],
    contacts: [],
    providerMessageId: null,
    trackedLinks: [],
    events: [],
  };
}

function normalizeTrackedLinks(links?: MessageResponse['tracked_links']): TrackedLink[] {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.flatMap((link) =>
    link.token && link.url && link.created_at
      ? [
          {
            token: link.token,
            url: link.url,
            label: link.label,
            createdAt: link.created_at,
          },
        ]
      : [],
  );
}

function normalizeTemplate(item: TemplateResponse): TemplateSummary {
  return {
    id: item.id,
    name: item.name ?? 'Untitled template',
    slug: item.slug ?? item.id,
    category: item.category ?? 'General',
    description: item.description ?? '',
    subject: item.subject ?? '',
    preheader: item.preheader ?? '',
    htmlBody: item.html_body ?? '',
    textBody: item.text_body ?? '',
    isActive: item.is_active ?? true,
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
    versionCount: item.version_count ?? 1,
    currentVersion: item.current_version ?? item.version_count ?? 1,
  };
}

function normalizeTemplateVersion(item: TemplateVersionResponse): TemplateVersionSummary {
  return {
    id: item.id,
    templateId: item.template_id ?? '',
    versionNumber: item.version_number ?? 1,
    name: item.name ?? 'Untitled template',
    category: item.category ?? 'General',
    description: item.description ?? '',
    subject: item.subject ?? '',
    preheader: item.preheader ?? '',
    htmlBody: item.html_body ?? '',
    textBody: item.text_body ?? '',
    isActive: item.is_active ?? true,
    createdAt: item.created_at ?? new Date().toISOString(),
  };
}

function normalizeSeedPreview(items?: DashboardSummaryResponse['seed_preview']): SeedPreview[] {
  if (!Array.isArray(items) || !items.length) {
    return mockSeedPreview;
  }

  return items.flatMap((item) =>
    item.provider
      ? [
          {
            provider: item.provider,
            accepted: item.accepted ?? 'Pending',
            placement: item.placement ?? 'Pending',
            render: item.render ?? 'Pending',
          },
        ]
      : [],
  );
}

function normalizeSeedInbox(item: SeedInboxResponse): SeedInboxSummary {
  return {
    id: item.id,
    provider: item.provider ?? 'Unknown',
    label: item.label ?? 'Seed inbox',
    emailAddress: item.email_address ?? '',
    notes: item.notes ?? '',
    enabled: item.enabled ?? false,
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
  };
}

function normalizeSeedResult(item: SeedResultResponse): SeedTestResult {
  return {
    id: item.id ?? `result-${item.seed_inbox_id ?? 'unknown'}`,
    seedInboxId: item.seed_inbox_id ?? 'seed-unknown',
    provider: item.provider ?? 'Unknown',
    label: item.label ?? 'Seed inbox',
    emailAddress: item.email_address ?? '',
    accepted: item.accepted ?? null,
    placement: item.placement ?? 'pending',
    renderStatus: item.render_status ?? 'pending',
    notes: item.notes ?? '',
    checkedAt: item.checked_at ?? null,
    updatedAt: item.updated_at ?? item.checked_at ?? new Date().toISOString(),
  };
}

function normalizeSeedRun(item: SeedRunResponse): SeedTestRunSummary {
  return {
    id: item.id,
    identityId: item.identity_id ?? '',
    identity: item.identity ?? 'unknown',
    identityLabel: item.identity_label ?? 'Identity',
    messageId: item.message_id ?? null,
    templateId: item.template_id ?? null,
    subject: item.subject ?? 'Untitled seed run',
    status: item.status ?? 'pending',
    summary: item.summary ?? 'Awaiting seed results.',
    resultCount: item.result_count ?? 0,
    completedCount: item.completed_count ?? 0,
    acceptedCount: item.accepted_count ?? 0,
    rejectedCount: item.rejected_count ?? 0,
    inboxCount: item.inbox_count ?? 0,
    promotionsCount: item.promotions_count ?? 0,
    spamCount: item.spam_count ?? 0,
    missingCount: item.missing_count ?? 0,
    cleanCount: item.clean_count ?? 0,
    issuesCount: item.issues_count ?? 0,
    acceptanceScore: item.acceptance_score ?? 0,
    placementScore: item.placement_score ?? 0,
    renderScore: item.render_score ?? 0,
    overallScore: item.overall_score ?? 0,
    scoreState: item.score_state ?? 'attention',
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
    sentAt: item.sent_at ?? null,
  };
}

function normalizeSeedRunDetail(item: SeedRunResponse): SeedTestRunDetail {
  return {
    ...normalizeSeedRun(item),
    results: Array.isArray(item.results) ? item.results.map(normalizeSeedResult) : [],
  };
}

function normalizeMessageContact(item: NonNullable<MessageResponse['contacts']>[number]): MessageContact {
  return {
    id: item.id ?? `msgcontact-${item.contact_id ?? 'unknown'}`,
    contactId: item.contact_id ?? '',
    emailAddress: item.email_address ?? '',
    displayName: item.display_name ?? '',
    company: item.company ?? '',
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    contactNotes: item.contact_notes ?? '',
    deliveryStatus: item.delivery_status ?? 'draft',
    inferredOpenCount: item.inferred_open_count ?? 0,
    inferredClickCount: item.inferred_click_count ?? 0,
    replyState: item.reply_state ?? '',
    conversionState: item.conversion_state ?? '',
    engagementStatus: item.engagement_status ?? '',
    notes: item.notes ?? '',
    sentAt: item.sent_at ?? null,
    lastOpenedAt: item.last_opened_at ?? null,
    lastClickedAt: item.last_clicked_at ?? null,
    lastRepliedAt: item.last_replied_at ?? null,
    lastConvertedAt: item.last_converted_at ?? null,
    updatedAt: item.updated_at ?? new Date().toISOString(),
  };
}

function normalizeOperator(item: OperatorResponse): OperatorSummary {
  return {
    id: item.id,
    username: item.username ?? 'operator',
    displayName: item.display_name ?? item.username ?? 'Operator',
    role: item.role ?? 'admin',
    isActive: item.is_active ?? true,
    totpEnabled: item.totp_enabled ?? false,
    totpPending: item.totp_pending ?? false,
    lastLoginAt: item.last_login_at ?? null,
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
  };
}

function normalizeCampaign(item: CampaignResponse): CampaignSummary {
  return {
    id: item.id,
    name: item.name ?? 'Untitled campaign',
    objective: item.objective ?? '',
    status: item.status ?? 'draft',
    identityId: item.identity_id ?? '',
    identity: item.identity ?? 'unknown',
    identityLabel: item.identity_label ?? 'Identity',
    templateId: item.template_id ?? null,
    templateName: item.template_name ?? null,
    audienceLabel: item.audience_label ?? '',
    audienceEmails: item.audience_emails ?? '',
    audienceCount: item.audience_count ?? 0,
    sendWindow: item.send_window ?? '',
    notes: item.notes ?? '',
    scheduledFor: item.scheduled_for ?? null,
    messageCount: item.message_count ?? 0,
    sentCount: item.sent_count ?? 0,
    openEvents: item.open_events ?? 0,
    clickEvents: item.click_events ?? 0,
    replyEvents: item.reply_events ?? 0,
    conversionEvents: item.conversion_events ?? 0,
    lastRun: item.last_run ? normalizeCampaignRun(item.last_run) : null,
    recentRuns: Array.isArray(item.recent_runs) ? item.recent_runs.map(normalizeCampaignRun) : [],
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
  };
}

function normalizeCampaignRun(item: CampaignRunResponse): CampaignRunSummary {
  return {
    id: item.id,
    campaignId: item.campaign_id ?? '',
    messageId: item.message_id ?? null,
    mode: item.mode ?? 'live',
    triggerType: item.trigger_type ?? 'manual',
    status: item.status ?? 'pending',
    recipientCount: item.recipient_count ?? 0,
    sentCount: item.sent_count ?? 0,
    summary: item.summary ?? '',
    startedAt: item.started_at ?? new Date().toISOString(),
    completedAt: item.completed_at ?? null,
    createdAt: item.created_at ?? item.started_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.completed_at ?? item.started_at ?? new Date().toISOString(),
  };
}

function normalizeContactHistory(item: NonNullable<ContactResponse['history']>[number]): ContactHistoryItem {
  return {
    messageId: item.message_id ?? '',
    subject: item.subject ?? 'Untitled message',
    status: item.status ?? 'Draft',
    sendMode: item.send_mode ?? 'draft',
    deliveryStatus: item.delivery_status ?? 'draft',
    inferredOpenCount: item.inferred_open_count ?? 0,
    inferredClickCount: item.inferred_click_count ?? 0,
    replyState: item.reply_state ?? '',
    conversionState: item.conversion_state ?? '',
    engagementStatus: item.engagement_status ?? '',
    sentAt: item.sent_at ?? null,
    updatedAt: item.updated_at ?? new Date().toISOString(),
  };
}

function normalizeContact(item: ContactResponse): ContactSummary {
  return {
    id: item.id,
    emailAddress: item.email_address ?? '',
    displayName: item.display_name ?? '',
    company: item.company ?? '',
    tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === 'string') : [],
    source: item.source ?? '',
    notes: item.notes ?? '',
    messageCount: item.message_count ?? 0,
    sentCount: item.sent_count ?? 0,
    openCount: item.open_count ?? 0,
    clickCount: item.click_count ?? 0,
    replyCount: item.reply_count ?? 0,
    conversionCount: item.conversion_count ?? 0,
    engagementScore: item.engagement_score ?? 0,
    lastActivityAt: item.last_activity_at ?? null,
    createdAt: item.created_at ?? new Date().toISOString(),
    updatedAt: item.updated_at ?? item.created_at ?? new Date().toISOString(),
    history: Array.isArray(item.history) ? item.history.map(normalizeContactHistory) : [],
  };
}

function normalizeAnalyticsSummary(payload?: AnalyticsSummaryResponse | null): AnalyticsSummary {
  const overview = payload?.overview;

  const identityPerformance: IdentityPerformance[] = Array.isArray(payload?.identity_performance)
    ? payload.identity_performance.flatMap((item) =>
        item.id
          ? [
              {
                id: item.id,
                label: item.label ?? 'Identity',
                address: item.address ?? 'unknown',
                totalMessages: item.total_messages ?? 0,
                sentCount: item.sent_count ?? 0,
                openEvents: item.open_events ?? 0,
                clickEvents: item.click_events ?? 0,
                replyEvents: item.reply_events ?? 0,
                engagementScore: item.engagement_score ?? 0,
              },
            ]
          : [],
      )
    : [];

  const templatePerformance: TemplatePerformance[] = Array.isArray(payload?.template_performance)
    ? payload.template_performance.flatMap((item) =>
        item.id
          ? [
              {
                id: item.id,
                name: item.name ?? 'Template',
                category: item.category ?? 'General',
                totalMessages: item.total_messages ?? 0,
                sentCount: item.sent_count ?? 0,
                openEvents: item.open_events ?? 0,
                clickEvents: item.click_events ?? 0,
                replyEvents: item.reply_events ?? 0,
              },
            ]
          : [],
      )
    : [];

  const seedRuns: SeedRunInsight[] = Array.isArray(payload?.seed_runs)
    ? payload.seed_runs.flatMap((item) =>
        item.id
          ? [
              {
                id: item.id,
                subject: item.subject ?? 'Seed run',
                status: item.status ?? 'pending',
                overallScore: item.overall_score ?? 0,
                acceptanceScore: item.acceptance_score ?? 0,
                placementScore: item.placement_score ?? 0,
                renderScore: item.render_score ?? 0,
                sentAt: item.sent_at ?? null,
                updatedAt: item.updated_at ?? new Date().toISOString(),
              },
            ]
          : [],
      )
    : [];

  const campaigns = Array.isArray(payload?.campaigns) ? payload.campaigns.map(normalizeCampaign) : [];

  return {
    overview: {
      totalMessages: overview?.total_messages ?? 0,
      sentMessages: overview?.sent_messages ?? 0,
      draftMessages: overview?.draft_messages ?? 0,
      reviewMessages: overview?.review_messages ?? 0,
      contactsCount: overview?.contacts_count ?? 0,
      openEvents: overview?.open_events ?? 0,
      clickEvents: overview?.click_events ?? 0,
      replyEvents: overview?.reply_events ?? 0,
      conversionEvents: overview?.conversion_events ?? 0,
      seedAverageScore: overview?.seed_average_score ?? 0,
      activeCampaigns: overview?.active_campaigns ?? 0,
    },
    identityPerformance,
    templatePerformance,
    seedRuns,
    campaigns,
    topContacts: Array.isArray(payload?.top_contacts) ? payload.top_contacts.map(normalizeContact) : [],
  };
}

export async function getDashboardShellData(): Promise<DashboardShellData> {
  const payload = await fetchServerJson<DashboardSummaryResponse>('/dashboard/summary');

  if (!payload) {
    return {
      overview: mockOverview,
      messages: mockMessages,
      identities: mockIdentities,
      domains: mockDomainHealth,
      alerts: mockAlerts,
      seedPreview: mockSeedPreview,
    };
  }

  return {
    overview: normalizeOverview(payload.overview),
    messages: Array.isArray(payload.messages) && payload.messages.length ? payload.messages.map(normalizeMessage) : mockMessages,
    identities: Array.isArray(payload.identities) && payload.identities.length ? payload.identities.map(normalizeIdentity) : mockIdentities,
    domains:
      Array.isArray(payload.domains) && payload.domains.length
        ? payload.domains.flatMap((domain) =>
            domain.domain
              ? [
                  {
                    domain: domain.domain,
                    spf: domain.spf ?? 'warn',
                    dkim: domain.dkim ?? 'warn',
                    dmarc: domain.dmarc ?? 'warn',
                    mx: domain.mx ?? 'warn',
                    readiness: domain.readiness ?? 'Pending diagnostics',
                    notes: domain.notes ?? '',
                    lastCheckedAt: domain.last_checked_at,
                  },
                ]
              : [],
          )
        : mockDomainHealth,
    alerts: Array.isArray(payload.alerts) && payload.alerts.length ? payload.alerts : mockAlerts,
    seedPreview: normalizeSeedPreview(payload.seed_preview),
  };
}

export async function getMessages(): Promise<MessageSummary[]> {
  const payload = await fetchServerJson<{ items?: MessageResponse[] }>('/messages');
  if (!payload?.items?.length) {
    return mockMessages;
  }
  return payload.items.map(normalizeMessage);
}

export async function getMessageDetail(messageId: string): Promise<MessageDetail | null> {
  const payload = await fetchServerJson<MessageResponse>(`/messages/${messageId}`);
  if (!payload) {
    return buildMockMessageDetail(messageId);
  }

  return {
    ...normalizeMessage(payload),
    preheader: payload.preheader ?? '',
    htmlBody: payload.html_body ?? '<p>No HTML body stored.</p>',
    textBody: payload.text_body ?? '',
    recipientsList: Array.isArray(payload.recipients) ? payload.recipients : [],
    contacts: Array.isArray(payload.contacts) ? payload.contacts.map(normalizeMessageContact) : [],
    providerMessageId: payload.provider_message_id ?? null,
    trackedLinks: normalizeTrackedLinks(payload.tracked_links),
    events: Array.isArray(payload.events)
      ? payload.events.flatMap((event) =>
          event.id && event.type && event.occurred_at
            ? [
                {
                  id: event.id,
                  type: event.type,
                  occurredAt: event.occurred_at,
                  payload: event.payload ?? {},
                },
              ]
            : [],
        )
      : [],
  };
}

export async function getIdentities(): Promise<IdentitySummary[]> {
  const payload = await fetchServerJson<{ items?: IdentityResponse[] }>('/identities');
  if (!payload?.items?.length) {
    return mockIdentities;
  }
  return payload.items.map(normalizeIdentity);
}

export async function getTemplates(): Promise<TemplateSummary[]> {
  const payload = await fetchServerJson<{ items?: TemplateResponse[] }>('/templates');
  if (!payload?.items?.length) {
    return mockTemplates;
  }
  return payload.items.map(normalizeTemplate);
}

export async function getTemplateVersions(templateId: string): Promise<TemplateVersionSummary[]> {
  const payload = await fetchServerJson<{ items?: TemplateVersionResponse[] }>(`/templates/${templateId}/versions`);
  if (!payload?.items?.length) {
    return [];
  }
  return payload.items.map(normalizeTemplateVersion);
}

export async function getSeedInboxes(): Promise<SeedInboxSummary[]> {
  const payload = await fetchServerJson<{ items?: SeedInboxResponse[] }>('/seed-tests/inboxes');
  if (!payload?.items?.length) {
    return mockSeedInboxes;
  }
  return payload.items.map(normalizeSeedInbox);
}

export async function getSeedRuns(): Promise<SeedTestRunSummary[]> {
  const payload = await fetchServerJson<{ items?: SeedRunResponse[] }>('/seed-tests/runs');
  if (!payload?.items?.length) {
    return mockSeedRuns;
  }
  return payload.items.map(normalizeSeedRun);
}

export async function getSeedRun(runId: string): Promise<SeedTestRunDetail | null> {
  const payload = await fetchServerJson<SeedRunResponse>(`/seed-tests/runs/${runId}`);
  return payload ? normalizeSeedRunDetail(payload) : null;
}

export async function getOperators(): Promise<OperatorSummary[]> {
  const payload = await fetchServerJson<{ items?: OperatorResponse[] }>('/auth/operators');
  if (!payload?.items?.length) {
    return [];
  }
  return payload.items.map(normalizeOperator);
}

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  const payload = await fetchServerJson<AnalyticsSummaryResponse>('/analytics/summary');
  return normalizeAnalyticsSummary(payload);
}

export async function getCampaigns(): Promise<CampaignSummary[]> {
  const payload = await fetchServerJson<{ items?: CampaignResponse[] }>('/campaigns');
  if (!payload?.items?.length) {
    return [];
  }
  return payload.items.map(normalizeCampaign);
}

export async function getContacts(): Promise<ContactSummary[]> {
  const payload = await fetchServerJson<{ items?: ContactResponse[] }>('/contacts');
  if (!payload?.items?.length) {
    return [];
  }
  return payload.items.map(normalizeContact);
}

export async function getContact(contactId: string): Promise<ContactSummary | null> {
  const payload = await fetchServerJson<ContactResponse>(`/contacts/${contactId}`);
  return payload ? normalizeContact(payload) : null;
}

export function getClientApiBase(): string {
  return CLIENT_API_BASE;
}
