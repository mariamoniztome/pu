import { ICalendarConnection } from '../models/CalendarConnection.js';
import { encrypt, decrypt } from '../utils/encryption.js';

const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const EVENTS_URL = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

// Read-only: this feature only overlays "busy" blocks on the doctor's own
// calendar, it never writes back to Google.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

function getClientConfig() {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Google Calendar integration is not configured');
  }
  return { clientId, clientSecret, redirectUri };
}

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REDIRECT_URI
  );
}

export function getGoogleAuthUrl(state: string): string {
  const { clientId, redirectUri } = getClientConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    // access_type=offline + prompt=consent is what makes Google actually
    // hand back a refresh_token instead of only a short-lived access_token.
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  accountLabel: string;
}

export async function exchangeGoogleCode(code: string): Promise<GoogleTokens> {
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
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${await response.text()}`);
  }
  const data = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  const userResponse = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${data.access_token}` },
  });
  const user = userResponse.ok ? ((await userResponse.json()) as { email?: string }) : {};

  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: new Date(Date.now() + data.expires_in * 1000),
    accountLabel: user.email || 'Google Calendar',
  };
}

async function refreshGoogleToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: Date }> {
  const { clientId, clientSecret } = getClientConfig();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'refresh_token',
    }),
  });
  if (!response.ok) {
    throw new Error(`Google token refresh failed: ${await response.text()}`);
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
    throw new Error('Missing Google refresh token — reconnect this calendar');
  }
  const { accessToken, expiresAt } = await refreshGoogleToken(decrypt(connection.refreshTokenEnc));
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

export async function fetchGoogleEvents(
  connection: ICalendarConnection,
  timeMin: Date,
  timeMax: Date
): Promise<FetchedEvent[]> {
  const accessToken = await getValidAccessToken(connection);
  const events: FetchedEvent[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: 'true',
      orderBy: 'startTime',
      maxResults: '2500',
    });
    if (pageToken) params.set('pageToken', pageToken);

    const response = await fetch(`${EVENTS_URL}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!response.ok) {
      throw new Error(`Google Calendar fetch failed: ${await response.text()}`);
    }
    const data = (await response.json()) as {
      items?: Array<{
        id: string;
        summary?: string;
        status?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
      }>;
      nextPageToken?: string;
    };

    for (const item of data.items || []) {
      if (item.status === 'cancelled') continue;
      const start = item.start?.dateTime || item.start?.date;
      const end = item.end?.dateTime || item.end?.date;
      if (!start || !end) continue;
      events.push({
        externalId: item.id,
        title: item.summary || '',
        startTime: new Date(start),
        endTime: new Date(end),
        allDay: Boolean(item.start?.date && !item.start?.dateTime),
      });
    }
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}
