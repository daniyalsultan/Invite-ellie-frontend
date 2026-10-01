import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useProfile } from '../../context/ProfileContext';
import {
  getConnectedCalendars,
  getCalendarConnectUrls,
  CalendarConnection,
} from '../../services/calendarApi';
import { getSlackConnectUrl, getSlackStatus, type SlackConnectionStatus } from '../../services/slackApi';
import { getNotionConnectUrl, getNotionStatus, type NotionConnectionStatus } from '../../services/notionApi';
import { getHubSpotConnectUrl, getHubSpotStatus, type HubSpotConnectionStatus } from '../../services/hubspotApi';
import googleMeetIcon from '../../assets/integration-google-meet.svg';
import microsoftTeamsIcon from '../../assets/integration-microsoft-teams.svg';
import slackLogo from '../../assets/Slack-Logo.png';
import notionLogo from '../../assets/notion_logo.png';

interface CalendarItem {
  id: 'google' | 'microsoft';
  name: string;
  icon: string;
  platform: 'google_calendar' | 'microsoft_outlook';
  description: string;
}

interface ExportItem {
  id: 'slack' | 'notion' | 'hubspot';
  name: string;
  icon?: string;
  iconColor?: string;
  description: string;
}

const CALENDARS: CalendarItem[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: googleMeetIcon,
    platform: 'google_calendar',
    description: 'Sync your Google Calendar so Ellie can auto-join and record your meetings.',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Calendar',
    icon: microsoftTeamsIcon,
    platform: 'microsoft_outlook',
    description: 'Connect Outlook to keep all your meeting notes in one place.',
  },
];

const EXPORTS: ExportItem[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: slackLogo,
    description: 'Share meeting summaries directly to your Slack channels.',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: notionLogo,
    description: 'Export your meeting notes and action items to Notion.',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    iconColor: '#FF7A59',
    description: 'Attach meeting notes to HubSpot contacts automatically.',
  },
];

export function OnboardingIntegrationsPage(): JSX.Element {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { profile } = useProfile();
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);
  const [slackStatus, setSlackStatus] = useState<SlackConnectionStatus>({ connected: false });
  const [notionStatus, setNotionStatus] = useState<NotionConnectionStatus>({ connected: false });
  const [hubspotStatus, setHubspotStatus] = useState<HubSpotConnectionStatus>({ connected: false });
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile?.id) return;
    void loadStatuses();
  }, [profile?.id]);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const email = searchParams.get('email');
    const team = searchParams.get('team');
    const workspace = searchParams.get('workspace');
    const portal = searchParams.get('portal');

    if (connected === 'google' || connected === 'microsoft') {
      const name = connected === 'google' ? 'Google Calendar' : 'Microsoft Calendar';
      setSuccessMessage(`${name} connected successfully${email ? ` for ${email}` : ''}`);
      setSearchParams({});
      if (profile?.id) void loadStatuses();
    } else if (connected === 'slack') {
      setSuccessMessage(`Slack connected${team ? ` to ${team}` : ''}`);
      setSearchParams({});
      if (profile?.id) setTimeout(() => void loadStatuses(), 500);
    } else if (connected === 'notion') {
      setSuccessMessage(`Notion connected${workspace ? ` to ${workspace}` : ''}`);
      setSearchParams({});
      if (profile?.id) setTimeout(() => void loadStatuses(), 500);
    } else if (connected === 'hubspot') {
      setSuccessMessage(`HubSpot connected${portal ? ` to portal ${portal}` : ''}`);
      setSearchParams({});
      if (profile?.id) setTimeout(() => void loadStatuses(), 500);
    }
  }, [searchParams]);

  const loadStatuses = async () => {
    if (!profile?.id) return;
    try {
      const [cals, slack, notion, hubspot] = await Promise.all([
        getConnectedCalendars(profile.id).catch(() => [] as CalendarConnection[]),
        getSlackStatus(profile.id).catch(() => ({ connected: false }) as SlackConnectionStatus),
        getNotionStatus(profile.id).catch(() => ({ connected: false }) as NotionConnectionStatus),
        getHubSpotStatus(profile.id).catch(() => ({ connected: false }) as HubSpotConnectionStatus),
      ]);
      setCalendars(cals);
      setSlackStatus(slack);
      setNotionStatus(notion);
      setHubspotStatus(hubspot);
    } catch {
      // Statuses loaded individually with fallbacks
    }
  };

  const isCalendarConnected = (platform: 'google_calendar' | 'microsoft_outlook') =>
    calendars.some((c) => c.platform === platform && c.connected);

  const isExportConnected = (id: 'slack' | 'notion' | 'hubspot') => {
    if (id === 'slack') return slackStatus.connected;
    if (id === 'notion') return notionStatus.connected;
    return hubspotStatus.connected;
  };

  const connectCalendar = async (cal: CalendarItem) => {
    if (!profile?.id) return;
    setConnecting(cal.id);
    setError(null);
    try {
      const urls = await getCalendarConnectUrls(profile.id, null, '/connect-integrations');
      const url = cal.platform === 'google_calendar' ? urls.googleCalendar : urls.microsoftOutlook;
      if (url) window.location.href = url;
      else throw new Error('Failed to get authorization URL');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      setConnecting(null);
    }
  };

  const connectExport = async (exp: ExportItem) => {
    if (!profile?.id) return;
    setConnecting(exp.id);
    setError(null);
    try {
      let url: string;
      const returnTo = '/connect-integrations';
      if (exp.id === 'slack') url = await getSlackConnectUrl(profile.id, returnTo);
      else if (exp.id === 'notion') url = await getNotionConnectUrl(profile.id, returnTo);
      else url = await getHubSpotConnectUrl(profile.id, returnTo);
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to connect to ${exp.name}`);
      setConnecting(null);
    }
  };

  const connectedCount =
    CALENDARS.filter((c) => isCalendarConnected(c.platform)).length +
    EXPORTS.filter((e) => isExportConnected(e.id)).length;

  return (
    <div className="ie-page pb-[80px] pt-[32px] lg:pb-[110px] lg:pt-[56px]">
      <div className="ie-wrap">
        <div className="mx-auto max-w-[900px]">
          <div className="text-center">
            <h1 className="ie-title">
              Connect Your Tools
            </h1>
            <p className="ie-lede mx-auto mt-4 max-w-[600px]">
              Connect your calendar so Ellie can join and record your meetings automatically. You can also link your favourite tools for exporting notes.
            </p>
          </div>

          {error && (
            <div className="ie-error mt-6" role="alert">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="ie-success mt-6" role="status">
              {successMessage}
            </div>
          )}

          <div className="mt-10">
            <h2 className="ie-subtitle">
              Calendar
            </h2>
            <p className="mt-1.5 text-[0.95rem] text-ie-muted">
              Connect at least one calendar to let Ellie auto-join your meetings.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {CALENDARS.map((cal) => {
                const connected = isCalendarConnected(cal.platform);
                return (
                  <div
                    key={cal.id}
                    className={`flex items-center gap-4 rounded-[20px] p-5 transition-all ${
                      connected
                        ? 'bg-ie-tAqua/40 ring-2 ring-ie-green/50'
                        : 'bg-white ring-1 ring-ie-line hover:bg-ie-bgAlt'
                    }`}
                  >
                    <img src={cal.icon} alt="" className="h-12 w-12 object-contain" />
                    <div className="flex-1 min-w-0">
                      <p className="text-[1rem] font-semibold text-ie-text">{cal.name}</p>
                      <p className="mt-1 text-[0.88rem] leading-[1.45] text-ie-muted">
                        {cal.description}
                      </p>
                    </div>
                    {connected ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-ie-tAqua px-3 py-1.5 text-[0.85rem] font-semibold text-[#1D6B5A] ring-1 ring-inset ring-ie-green/30">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void connectCalendar(cal)}
                        disabled={connecting === cal.id}
                        className="ie-btn-primary ie-btn-sm shrink-0"
                      >
                        {connecting === cal.id ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-10">
            <h2 className="ie-subtitle">
              Export Integrations
            </h2>
            <p className="mt-1.5 text-[0.95rem] text-ie-muted">
              Optionally connect tools where you'd like Ellie to export meeting notes.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {EXPORTS.map((exp) => {
                const connected = isExportConnected(exp.id);
                return (
                  <div
                    key={exp.id}
                    className={`flex flex-col items-center rounded-[20px] p-5 text-center transition-all ${
                      connected
                        ? 'bg-ie-tAqua/40 ring-2 ring-ie-green/50'
                        : 'bg-white ring-1 ring-ie-line hover:bg-ie-bgAlt'
                    }`}
                  >
                    <div className="flex h-12 items-center justify-center">
                      {exp.icon ? (
                        <img src={exp.icon} alt="" className="h-10 object-contain" />
                      ) : (
                        <span
                          className="text-[22px] font-bold"
                          style={{ color: exp.iconColor || '#333' }}
                        >
                          {exp.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-[1rem] font-semibold text-ie-text">
                      {exp.name}
                    </p>
                    <p className="mt-1 text-[0.88rem] leading-[1.45] text-ie-muted">
                      {exp.description}
                    </p>
                    {connected ? (
                      <span className="mt-4 flex items-center gap-1.5 rounded-full bg-ie-tAqua px-3 py-1.5 text-[0.85rem] font-semibold text-[#1D6B5A] ring-1 ring-inset ring-ie-green/30">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Connected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void connectExport(exp)}
                        disabled={connecting === exp.id}
                        className="ie-btn-primary ie-btn-sm mt-4"
                      >
                        {connecting === exp.id ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mx-auto mt-12 max-w-[440px]">
            <button
              type="button"
              onClick={() => navigate('/dashboard', { replace: true })}
              className="ie-btn-primary w-full py-[17px] text-[1.05rem]"
            >
              {connectedCount > 0 ? 'Continue to Dashboard' : 'Continue to Dashboard'}
            </button>
            {connectedCount === 0 && (
              <p className="mt-3 text-center text-[0.93rem] text-ie-muted">
                You can connect these later from the Integrations page.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
