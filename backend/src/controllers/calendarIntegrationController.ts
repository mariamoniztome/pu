import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import CalendarConnection, { ICalendarConnection } from '../models/CalendarConnection.js';
import ExternalCalendarEvent from '../models/ExternalCalendarEvent.js';
import { encrypt } from '../utils/encryption.js';
import { JWT_SECRET } from '../middleware/auth.js';
import { isGoogleConfigured, getGoogleAuthUrl, exchangeGoogleCode, fetchGoogleEvents } from '../integrations/googleCalendar.js';
import { isOutlookConfigured, getOutlookAuthUrl, exchangeOutlookCode, fetchOutlookEvents } from '../integrations/outlookCalendar.js';
import { verifyIcloudCredentials, fetchIcloudEvents } from '../integrations/icloudCalendar.js';

interface OAuthState {
  doctorId: string;
  organizationId: string;
}

function signState(payload: OAuthState): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '10m' });
}

function verifyState(token: string): OAuthState {
  return jwt.verify(token, JWT_SECRET) as OAuthState;
}

// The historical backfill range for a sync — pulls years of past events (not
// just upcoming ones), per the ask that drove this feature: connect once and
// see everything, old included.
const SYNC_PAST_YEARS = 3;
const SYNC_FUTURE_YEARS = 1;

function syncRange(): { start: Date; end: Date } {
  const now = new Date();
  const start = new Date(now);
  start.setFullYear(start.getFullYear() - SYNC_PAST_YEARS);
  const end = new Date(now);
  end.setFullYear(end.getFullYear() + SYNC_FUTURE_YEARS);
  return { start, end };
}

async function persistEvents(
  connection: ICalendarConnection,
  events: { externalId: string; title: string; startTime: Date; endTime: Date; allDay: boolean }[]
): Promise<void> {
  await ExternalCalendarEvent.deleteMany({ connection: connection._id });
  if (events.length === 0) return;
  await ExternalCalendarEvent.insertMany(
    events.map((event) => ({
      organization: connection.organization,
      doctor: connection.doctor,
      connection: connection._id,
      provider: connection.provider,
      externalId: event.externalId,
      title: event.title,
      startTime: event.startTime,
      endTime: event.endTime,
      allDay: event.allDay,
    }))
  );
}

async function runSync(connection: ICalendarConnection): Promise<void> {
  const { start, end } = syncRange();
  try {
    const events =
      connection.provider === 'google'
        ? await fetchGoogleEvents(connection, start, end)
        : connection.provider === 'outlook'
        ? await fetchOutlookEvents(connection, start, end)
        : await fetchIcloudEvents(connection, start, end);

    await persistEvents(connection, events);
    connection.status = 'connected';
    connection.lastSyncError = undefined;
    connection.lastSyncedAt = new Date();
    await connection.save();
  } catch (error: any) {
    connection.status = 'error';
    connection.lastSyncError = error.message;
    connection.lastSyncedAt = new Date();
    await connection.save();
    throw error;
  }
}

export const listConnections = async (req: Request, res: Response): Promise<void> => {
  try {
    const connections = await CalendarConnection.find({ doctor: req.doctor._id }).sort({ provider: 1 });
    res.json({
      connections: connections.map((c) => ({
        _id: c._id,
        provider: c.provider,
        accountLabel: c.accountLabel,
        status: c.status,
        lastSyncedAt: c.lastSyncedAt,
        lastSyncError: c.lastSyncError,
      })),
      googleConfigured: isGoogleConfigured(),
      outlookConfigured: isOutlookConfigured(),
    });
  } catch (error: any) {
    res.status(500).json({ message: req.t('calendarIntegrations.listFailed'), error: error.message });
  }
};

export const startGoogleConnect = async (req: Request, res: Response): Promise<void> => {
  if (!isGoogleConfigured()) {
    res.status(400).json({ message: req.t('calendarIntegrations.googleNotConfigured') });
    return;
  }
  const state = signState({ doctorId: req.doctor._id.toString(), organizationId: req.organization._id.toString() });
  res.json({ url: getGoogleAuthUrl(state) });
};

export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectTo = (status: 'connected' | 'error') =>
    res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&calendar=google&status=${status}`);

  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      redirectTo('error');
      return;
    }
    const payload = verifyState(state);
    const tokens = await exchangeGoogleCode(code);

    const connection = await CalendarConnection.findOneAndUpdate(
      { doctor: payload.doctorId, provider: 'google' },
      {
        organization: payload.organizationId,
        doctor: payload.doctorId,
        provider: 'google',
        accountLabel: tokens.accountLabel,
        accessTokenEnc: encrypt(tokens.accessToken),
        refreshTokenEnc: tokens.refreshToken ? encrypt(tokens.refreshToken) : undefined,
        tokenExpiresAt: tokens.expiresAt,
        status: 'connected',
        lastSyncError: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('+accessTokenEnc +refreshTokenEnc');

    if (connection) {
      runSync(connection).catch((err) => console.error('Google calendar sync failed:', err));
    }
    redirectTo('connected');
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);
    redirectTo('error');
  }
};

export const startOutlookConnect = async (req: Request, res: Response): Promise<void> => {
  if (!isOutlookConfigured()) {
    res.status(400).json({ message: req.t('calendarIntegrations.outlookNotConfigured') });
    return;
  }
  const state = signState({ doctorId: req.doctor._id.toString(), organizationId: req.organization._id.toString() });
  res.json({ url: getOutlookAuthUrl(state) });
};

export const outlookCallback = async (req: Request, res: Response): Promise<void> => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const redirectTo = (status: 'connected' | 'error') =>
    res.redirect(`${frontendUrl}/dashboard/settings?tab=integrations&calendar=outlook&status=${status}`);

  try {
    const { code, state } = req.query as { code?: string; state?: string };
    if (!code || !state) {
      redirectTo('error');
      return;
    }
    const payload = verifyState(state);
    const tokens = await exchangeOutlookCode(code);

    const connection = await CalendarConnection.findOneAndUpdate(
      { doctor: payload.doctorId, provider: 'outlook' },
      {
        organization: payload.organizationId,
        doctor: payload.doctorId,
        provider: 'outlook',
        accountLabel: tokens.accountLabel,
        accessTokenEnc: encrypt(tokens.accessToken),
        refreshTokenEnc: tokens.refreshToken ? encrypt(tokens.refreshToken) : undefined,
        tokenExpiresAt: tokens.expiresAt,
        status: 'connected',
        lastSyncError: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('+accessTokenEnc +refreshTokenEnc');

    if (connection) {
      runSync(connection).catch((err) => console.error('Outlook calendar sync failed:', err));
    }
    redirectTo('connected');
  } catch (error: any) {
    console.error('Outlook OAuth callback error:', error);
    redirectTo('error');
  }
};

export const connectIcloud = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, appSpecificPassword } = req.body as { email?: string; appSpecificPassword?: string };
    if (!email || !appSpecificPassword) {
      res.status(400).json({ message: req.t('calendarIntegrations.icloudCredentialsRequired') });
      return;
    }

    const { calendarUrls } = await verifyIcloudCredentials(email, appSpecificPassword);

    const connection = await CalendarConnection.findOneAndUpdate(
      { doctor: req.doctor._id, provider: 'icloud' },
      {
        organization: req.organization._id,
        doctor: req.doctor._id,
        provider: 'icloud',
        accountLabel: email,
        credentialEnc: encrypt(appSpecificPassword),
        calendarUrls,
        status: 'connected',
        lastSyncError: undefined,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).select('+credentialEnc');

    if (connection) {
      await runSync(connection);
    }

    res.status(200).json({ message: req.t('calendarIntegrations.icloudConnected') });
  } catch (error: any) {
    res.status(400).json({ message: req.t('calendarIntegrations.icloudConnectFailed'), error: error.message });
  }
};

export const syncConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await CalendarConnection.findOne({ _id: req.params.id, doctor: req.doctor._id }).select(
      '+accessTokenEnc +refreshTokenEnc +credentialEnc'
    );
    if (!connection) {
      res.status(404).json({ message: req.t('calendarIntegrations.connectionNotFound') });
      return;
    }

    await runSync(connection);
    res.status(200).json({ message: req.t('calendarIntegrations.syncSuccessful'), lastSyncedAt: connection.lastSyncedAt });
  } catch (error: any) {
    res.status(500).json({ message: req.t('calendarIntegrations.syncFailed'), error: error.message });
  }
};

export const disconnectConnection = async (req: Request, res: Response): Promise<void> => {
  try {
    const connection = await CalendarConnection.findOneAndDelete({ _id: req.params.id, doctor: req.doctor._id });
    if (!connection) {
      res.status(404).json({ message: req.t('calendarIntegrations.connectionNotFound') });
      return;
    }
    await ExternalCalendarEvent.deleteMany({ connection: connection._id });
    res.status(200).json({ message: req.t('calendarIntegrations.disconnected') });
  } catch (error: any) {
    res.status(500).json({ message: req.t('calendarIntegrations.disconnectFailed'), error: error.message });
  }
};

// Threshold for the lazy re-sync triggered by loading the calendar view —
// there's no cron/queue in this app, so "freshness" is best-effort, driven
// by usage instead of a background job.
const STALE_SYNC_MS = 15 * 60 * 1000;

export const getExternalEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const connections = await CalendarConnection.find({ doctor: req.doctor._id }).select(
      '+accessTokenEnc +refreshTokenEnc +credentialEnc'
    );

    const now = Date.now();
    await Promise.all(
      connections
        .filter((c) => !c.lastSyncedAt || now - c.lastSyncedAt.getTime() > STALE_SYNC_MS)
        .map((c) => runSync(c).catch((err) => console.error(`${c.provider} calendar sync failed:`, err)))
    );

    const { start, end } = req.query as { start?: string; end?: string };
    const query: any = { doctor: req.doctor._id };
    if (start) query.endTime = { $gte: new Date(start) };
    if (end) query.startTime = { $lte: new Date(end) };

    const events = await ExternalCalendarEvent.find(query).sort({ startTime: 1 });
    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ message: req.t('calendarIntegrations.eventsFailed'), error: error.message });
  }
};
