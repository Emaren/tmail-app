import { mockAlerts, mockDomainHealth, mockIdentities, mockMessages, mockOverview, mockSeedPreview } from '@/lib/mock-data';
import {
  AlertItem,
  DashboardOverview,
  DashboardShellData,
  DomainHealth,
  IdentitySummary,
  MessageDetail,
  MessageSummary,
  OpenEvent,
  SeedPreview,
  TopUser,
  TrackedLink,
} from '@/lib/types';

const serverApiBase = process.env.TMAIL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? '';

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
  status?: MessageSummary['status'];
  recipient_count?: number;
  sent_at?: string | null;
  created_at?: string;
  opens?: number;
  clicks?: number;
  replies?: number;
  error_message?: string | null;
  send_mode?: string;
  preheader?: string;
  html_body?: string;
  text_body?: string;
  recipients?: string[];
  provider_message_id?: string | null;
  tracked_links?: Array<{ token?: string; url?: string; label?: string | null; created_at?: string }>;
  events?: Array<{ id?: string; type?: string; occurred_at?: string; payload?: Record<string, unknown> }>;
}

interface DashboardSummaryResponse {
  overview?: StatsResponse;
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
}

async function fetchApi<T>(path: string): Promise<T | null> {
  if (!serverApiBase) {
    return null;
  }

  try {
    const response = await fetch(`${serverApiBase}${path}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
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

export async function getDashboardShellData(): Promise<DashboardShellData> {
  const payload = await fetchApi<DashboardSummaryResponse>('/dashboard/summary');

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
    seedPreview: mockSeedPreview,
  };
}

export async function getMessages(): Promise<MessageSummary[]> {
  const payload = await fetchApi<{ items?: MessageResponse[] }>('/messages');
  if (!payload?.items?.length) {
    return mockMessages;
  }
  return payload.items.map(normalizeMessage);
}

export async function getMessageDetail(messageId: string): Promise<MessageDetail | null> {
  const payload = await fetchApi<MessageResponse>(`/messages/${messageId}`);
  if (!payload) {
    return buildMockMessageDetail(messageId);
  }

  return {
    ...normalizeMessage(payload),
    preheader: payload.preheader ?? '',
    htmlBody: payload.html_body ?? '<p>No HTML body stored.</p>',
    textBody: payload.text_body ?? '',
    recipientsList: Array.isArray(payload.recipients) ? payload.recipients : [],
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
  const payload = await fetchApi<{ items?: IdentityResponse[] }>('/identities');
  if (!payload?.items?.length) {
    return mockIdentities;
  }
  return payload.items.map(normalizeIdentity);
}

export function getClientApiBase(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? '';
}
