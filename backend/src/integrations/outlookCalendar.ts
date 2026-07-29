import { ICalendarConnection } from '../models/CalendarConnection.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// The "common" tenant accepts both personal Microsoft accounts and work/
// school accounts, so we don't need the doctor to know which kind theirs is.
const AUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
const TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
const CALENDAR_VIEW_URL = 'https://graph.microsoft.com/v1.0/me/calendarview';
const ME_URL = 'https://graph.microsoft.com/v1.0/me';

const SCOPES = 'openid profile email offline_access Calendars.Read User.Read';

function getClientConfig() {
  const clientId = process.env.MICROSOFT_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.MICROSOFT_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.MICROSOFT_CALENDAR_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Outlook Calendar integration is not configured');
  }
  return { clientId, clientSecret, redirectUri };
}

export function isOutlookConfigured(): boolean {
  return Boolean(
    process.env.MICROSOFT_CALENDAR_CLIENT_ID &&
      process.env.MICROSOFT_CALENDAR_CLIENT_SECRET &&
      process.env.MICROSOFT_CALENDAR_REDIRECT_URI
  );
}

export function getOutlookAuthUrl(state: string): string {
  const { clientId, redirectUri } = getClientConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    response_mode: 'query',
    scope: SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface OutlookTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  accountLabel: string;
}

export async function exchangeOutlookCode(code: string): Promise<OutlookTokens> {
  const { clientId, clientSecret, redirectUri } = getClientConfig();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
      scope: SCOPES,
    }),
  });
  if (!response.ok) {
    throw new Error(`Outlook token exchange failed: ${await response.text()}`);
  }
  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const meResponse = await fetch(ME_URL, { headers: { Authorization: `Bearer ${data.access_token}` } });
  const me = meResponse.ok ? ((await meResponse.json()) as { mail?: string; userPrincipalName?: string }) : {};

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    accountLabel: me.mail || me.userPrincipalName || 'Outlook Calendar',
  };
}

async function refreshOutlookToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const { clientId, clientSecret } = getClientConfig();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
      scope: SCOPES,
    }),
  });
  if (!response.ok) {
    throw new Error(`Outlook token refresh failed: ${await response.text()}`);
  }
  const data = (await response.json()) as { access_token: string; expires_in: number };
  return { accessToken: data.access_token, expiresAt: new Date(Date.now() + data.expires_in * 1000) };
}

async function getValidAccessToken(connection: ICalendarConnection): Promise<string> {
  const now = Date.now();
  if (connection.accessTokenEnc && connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() - 60_000 > now) {
    return decrypt(connection.accessTokenEnc);
  }
  if (!connection.refreshTokenEnc) {
    throw new Error('Missing Outlook refresh token — reconnect this calendar');
  }
  const { accessToken, expiresAt } = await refreshOutlookToken(decrypt(connection.refreshTokenEnc));
  connection.accessTokenEnc = encrypt(accessToken);
  connection.tokenExpiresAt = expiresAt;
  await connection.save();
  return accessToken;
}

export interface FetchedEvent {
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

export async function fetchOutlookEvents(
  connection: ICalendarConnection,
  start: Date,
  end: Date
): Promise<FetchedEvent[]> {
  const accessToken = await getValidAccessToken(connection);
  const events: FetchedEvent[] = [];
  let url: string | null =
    `${CALENDAR_VIEW_URL}?startDateTime=${encodeURIComponent(start.toISOString())}` +
    `&endDateTime=${encodeURIComponent(end.toISOString())}&$top=999&$select=id,subject,start,end,isAllDay`;

  while (url) {
    const response: Response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        // Pins the returned start/end dateTime strings to UTC so we don't
        // have to resolve each event's own IANA timezone name ourselves.
        Prefer: 'outlook.timezone="UTC"',
      },
    });
    if (!response.ok) {
      throw new Error(`Outlook Calendar fetch failed: ${await response.text()}`);
    }
    const data = (await response.json()) as {
      value?: Array<{
        id: string;
        subject?: string;
        isAllDay?: boolean;
        start?: { dateTime?: string };
        end?: { dateTime?: string };
      }>;
      '@odata.nextLink'?: string;
    };

    for (const item of data.value || []) {
      if (!item.start?.dateTime || !item.end?.dateTime) continue;
      events.push({
        externalId: item.id,
        title: item.subject || '',
        // Graph's "UTC" dateTime strings omit the trailing Z.
        startTime: new Date(`${item.start.dateTime}Z`),
        endTime: new Date(`${item.end.dateTime}Z`),
        allDay: Boolean(item.isAllDay),
      });
    }
    url = data['@odata.nextLink'] || null;
  }

  return events;
}
