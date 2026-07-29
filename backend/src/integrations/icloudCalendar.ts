import { XMLParser } from 'fast-xml-parser';
import ical, { VEvent } from 'node-ical';
import { ICalendarConnection } from '../models/CalendarConnection.js';
import { decrypt } from '../utils/encryption.js';

// Apple has no consumer OAuth for iCloud calendars — the only integration
// path is CalDAV over Basic Auth with an app-specific password generated at
// appleid.apple.com, then a 3-step discovery dance (principal -> calendar
// home -> calendar collections) before we can query events.
const BASE_URL = 'https://caldav.icloud.com';

const xmlParser = new XMLParser({ removeNSPrefix: true, ignoreAttributes: false, attributeNamePrefix: '@_' });

function toArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

async function davRequest(
  url: string,
  method: string,
  body: string,
  auth: string,
  depth: string
): Promise<any> {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      Authorization: `Basic ${auth}`,
      Depth: depth,
    },
    body,
    redirect: 'manual',
  });

  // iCloud's front door redirects PROPFIND/REPORT to a region-specific host
  // (e.g. pXX-caldav.icloud.com) — the fetch client won't auto-follow those
  // for non-GET methods, so it's resolved manually here.
  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location');
    if (location) {
      return davRequest(new URL(location, url).toString(), method, body, auth, depth);
    }
  }

  if (response.status === 401 || response.status === 403) {
    throw new Error('Invalid Apple ID or app-specific password');
  }
  if (!response.ok) {
    throw new Error(`CalDAV request failed (${response.status}): ${await response.text()}`);
  }

  return xmlParser.parse(await response.text());
}

export async function verifyIcloudCredentials(
  email: string,
  appSpecificPassword: string
): Promise<{ calendarUrls: string[] }> {
  const auth = Buffer.from(`${email}:${appSpecificPassword}`).toString('base64');

  const principalXml = await davRequest(
    BASE_URL,
    'PROPFIND',
    '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><prop><current-user-principal/></prop></propfind>',
    auth,
    '0'
  );
  const principalHref = principalXml?.multistatus?.response?.propstat?.prop?.['current-user-principal']?.href;
  if (!principalHref) {
    throw new Error('Could not resolve the iCloud principal — check the Apple ID and app-specific password');
  }

  const principalUrl = new URL(principalHref, BASE_URL).toString();
  const homeXml = await davRequest(
    principalUrl,
    'PROPFIND',
    '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav"><prop><C:calendar-home-set/></prop></propfind>',
    auth,
    '0'
  );
  const homeHref = homeXml?.multistatus?.response?.propstat?.prop?.['calendar-home-set']?.href;
  if (!homeHref) {
    throw new Error('Could not resolve the iCloud calendar home');
  }

  const homeUrl = new URL(homeHref, BASE_URL).toString();
  const listXml = await davRequest(
    homeUrl,
    'PROPFIND',
    '<?xml version="1.0" encoding="utf-8" ?><propfind xmlns="DAV:"><prop><resourcetype/><displayname/></prop></propfind>',
    auth,
    '1'
  );

  const calendarUrls: string[] = [];
  for (const entry of toArray(listXml?.multistatus?.response)) {
    const resourcetype = entry?.propstat?.prop?.resourcetype;
    const isCalendar = resourcetype && typeof resourcetype === 'object' && 'calendar' in resourcetype;
    if (isCalendar && entry.href) {
      calendarUrls.push(new URL(entry.href, BASE_URL).toString());
    }
  }

  if (calendarUrls.length === 0) {
    throw new Error('No calendars were found for this iCloud account');
  }

  return { calendarUrls };
}

export interface FetchedEvent {
  externalId: string;
  title: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

function toCalDavTimestamp(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

export async function fetchIcloudEvents(
  connection: ICalendarConnection,
  rangeStart: Date,
  rangeEnd: Date
): Promise<FetchedEvent[]> {
  if (!connection.credentialEnc || !connection.calendarUrls?.length) {
    throw new Error('iCloud connection is missing credentials or calendars — reconnect this calendar');
  }
  const auth = Buffer.from(`${connection.accountLabel}:${decrypt(connection.credentialEnc)}`).toString('base64');

  const events: FetchedEvent[] = [];

  for (const calendarUrl of connection.calendarUrls) {
    const reportBody = `<?xml version="1.0" encoding="utf-8" ?>
<C:calendar-query xmlns:D="DAV:" xmlns:C="urn:ietf:params:xml:ns:caldav">
  <D:prop><C:calendar-data/></D:prop>
  <C:filter>
    <C:comp-filter name="VCALENDAR">
      <C:comp-filter name="VEVENT">
        <C:time-range start="${toCalDavTimestamp(rangeStart)}" end="${toCalDavTimestamp(rangeEnd)}"/>
      </C:comp-filter>
    </C:comp-filter>
  </C:filter>
</C:calendar-query>`;

    const reportXml = await davRequest(calendarUrl, 'REPORT', reportBody, auth, '1');

    for (const entry of toArray(reportXml?.multistatus?.response)) {
      const icsText: string | undefined = entry?.propstat?.prop?.['calendar-data'];
      if (!icsText) continue;

      const parsed = ical.parseICS(icsText);
      for (const component of Object.values(parsed)) {
        if (!component || component.type !== 'VEVENT') continue;
        const vevent = component as VEvent;
        if (!vevent.start || !vevent.end) continue;
        events.push({
          externalId: vevent.uid,
          title: (vevent.summary as string) || '',
          startTime: new Date(vevent.start),
          endTime: new Date(vevent.end),
          allDay: vevent.datetype === 'date',
        });
      }
    }
  }

  return events;
}
