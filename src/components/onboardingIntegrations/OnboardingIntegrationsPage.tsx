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
    <div className="bg-white pb-[80px] pt-[40px] lg:pb-[120px] lg:pt-[60px]">
      <div className="container-ellie">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center">
            <h1 className="font-nunito text-[32px] font-extrabold text-ellieBlack lg:text-[45px]">
              Connect Your Tools
            </h1>
            <p className="mx-auto mt-3 max-w-[560px] font-nunito text-[18px] leading-[1.5] text-[#545454] lg:text-[22px]">
              Connect your calendar so Ellie can join and record your meetings automatically. You can also link your favourite tools for exporting notes.
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-[12px] border border-red-200 bg-red-50 px-5 py-3 font-nunito text-[15px] text-red-600">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-[12px] border border-green-200 bg-green-50 px-5 py-3 font-nunito text-[15px] text-green-700">
              {successMessage}
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-nunito text-[20px] font-bold text-ellieBlack lg:text-[24px]">
              Calendar
            </h2>
            <p className="mt-1 font-nunito text-[15px] text-[#7A86A1]">
              Connect at least one calendar to let Ellie auto-join your meetings.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {CALENDARS.map((cal) => {
                const connected = isCalendarConnected(cal.platform);
                return (
                  <div
                    key={cal.id}
                    className={`flex items-center gap-4 rounded-[16px] border-2 p-5 transition-all ${
                      connected
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-[#E5E7EB] bg-white hover:border-ellieBlue/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    <img src={cal.icon} alt="" className="h-12 w-12 object-contain" />
                    <div className="flex-1 min-w-0">
                      <p className="font-nunito text-[16px] font-bold text-ellieBlack">{cal.name}</p>
                      <p className="mt-0.5 font-nunito text-[13px] leading-snug text-[#545454]">
                        {cal.description}
                      </p>
                    </div>
                    {connected ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 font-nunito text-[13px] font-semibold text-green-700">
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
                        className="shrink-0 rounded-[10px] bg-ellieBlue px-5 py-2.5 font-nunito text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
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
            <h2 className="font-nunito text-[20px] font-bold text-ellieBlack lg:text-[24px]">
              Export Integrations
            </h2>
            <p className="mt-1 font-nunito text-[15px] text-[#7A86A1]">
              Optionally connect tools where you'd like Ellie to export meeting notes.
            </p>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {EXPORTS.map((exp) => {
                const connected = isExportConnected(exp.id);
                return (
                  <div
                    key={exp.id}
                    className={`flex flex-col items-center rounded-[16px] border-2 p-5 text-center transition-all ${
                      connected
                        ? 'border-green-300 bg-green-50/50'
                        : 'border-[#E5E7EB] bg-white hover:border-ellieBlue/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]'
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
                    <p className="mt-3 font-nunito text-[15px] font-bold text-ellieBlack">
                      {exp.name}
                    </p>
                    <p className="mt-1 font-nunito text-[13px] leading-snug text-[#545454]">
                      {exp.description}
                    </p>
                    {connected ? (
                      <span className="mt-4 flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1.5 font-nunito text-[13px] font-semibold text-green-700">
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
                        className="mt-4 rounded-[10px] bg-ellieBlue px-5 py-2.5 font-nunito text-[14px] font-bold text-white transition hover:opacity-90 disabled:opacity-50"
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
              className="inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[16px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 lg:text-[20px]"
            >
              {connectedCount > 0 ? 'Continue to Dashboard' : 'Continue to Dashboard'}
            </button>
            {connectedCount === 0 && (
              <p className="mt-3 text-center font-nunito text-[14px] text-[#7A86A1]">
                You can connect these later from the Integrations page.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
