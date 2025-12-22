import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import {
  getConnectedCalendars,
  getCalendarConnectUrls,
  disconnectCalendar,
  getCalendarDetails,
  updateCalendarPreferences,
  syncCalendarEvents,
  setEventManualRecord,
  createBotForEvent,
  deleteBotForEvent,
  CalendarConnection,
  CalendarDetails,
} from '../../services/calendarApi';
import { getSlackConnectUrl, getSlackStatus, disconnectSlack, type SlackConnectionStatus } from '../../services/slackApi';
import { getNotionConnectUrl, getNotionStatus, disconnectNotion, type NotionConnectionStatus } from '../../services/notionApi';
import { getHubSpotConnectUrl, getHubSpotStatus, disconnectHubSpot, type HubSpotConnectionStatus } from '../../services/hubspotApi';
import googleMeetIcon from '../../assets/integration-google-meet.svg';
import microsoftTeamsIcon from '../../assets/integration-microsoft-teams.svg';
import slackLogo from '../../assets/Slack-Logo.png';
import notionLogo from '../../assets/notion_logo.png';

interface CalendarIntegration {
  id: 'google' | 'microsoft';
  name: string;
  icon: string;
  description: string;
  platform: 'google_calendar' | 'microsoft_outlook';
}

interface ExportIntegration {
  id: 'slack' | 'notion' | 'hubspot';
  name: string;
  icon?: string;
  iconColor?: string;
  description: string;
}

const CALENDAR_INTEGRATIONS: CalendarIntegration[] = [
  {
    id: 'google',
    name: 'Google Calendar',
    icon: googleMeetIcon,
    description: 'Connect Google Calendar to automatically capture meeting transcripts and summaries.',
    platform: 'google_calendar',
  },
  {
    id: 'microsoft',
    name: 'Microsoft Calendar',
    icon: microsoftTeamsIcon,
    description: 'Connect Microsoft Calendar to keep your meeting insights organized in one place.',
    platform: 'microsoft_outlook',
  },
];

const EXPORT_INTEGRATIONS: ExportIntegration[] = [
  {
    id: 'slack',
    name: 'Slack',
    icon: slackLogo,
    description: 'Export your meeting summaries and transcripts directly to Slack channels.',
  },
  {
    id: 'notion',
    name: 'Notion',
    icon: notionLogo,
    description: 'Sync your meeting insights and notes to Notion pages and databases.',
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    iconColor: '#FF7A59',
    description: 'Export meeting notes and summaries to HubSpot as notes for CRM tracking.',
  },
];

export function IntegrationsPage(): JSX.Element {
  const { profile, isLoading: isProfileLoading } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // Export integrations state
  const [slackStatus, setSlackStatus] = useState<SlackConnectionStatus>({ connected: false });
  const [notionStatus, setNotionStatus] = useState<NotionConnectionStatus>({ connected: false });
  const [hubspotStatus, setHubspotStatus] = useState<HubSpotConnectionStatus>({ connected: false });
  const [exportConnecting, setExportConnecting] = useState<'slack' | 'notion' | 'hubspot' | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarDetails | null>(null);
  const [loadingCalendarDetails, setLoadingCalendarDetails] = useState<string | null>(null);
  const [syncingCalendar, setSyncingCalendar] = useState<string | null>(null);
  const [creatingBot, setCreatingBot] = useState<string | null>(null);
  const [deletingBot, setDeletingBot] = useState<string | null>(null);
  const [allMeetings, setAllMeetings] = useState<Array<{
    calendarId: string;
    calendarName: string;
    calendarPlatform: string;
    calendarStatus: 'connected' | 'disconnected';
    events: Array<{
      id: string;
      title: string;
      start_time: string | null;
      end_time: string | null;
      meeting_url: string | null;
      should_record_manual: boolean | null;
      bots?: Array<{
        bot_id: string;
        join_at: string;
        created_at: string;
        status: string;
      }>;
      has_transcription?: boolean;
      has_summary?: boolean;
      has_action_items?: boolean;
    }>;
  }>>([]);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const selectedCalendarIdRef = useRef<string | null>(null);
  // Refs to store latest function references for WebSocket handler
  const fetchCalendarsRef = useRef<(() => Promise<void>) | null>(null);
  const handleViewCalendarRef = useRef<((calendarId: string) => Promise<void>) | null>(null);

  // Handle OAuth callback redirects for calendar integrations
  useEffect(() => {
    const connected = searchParams.get('connected');
    const email = searchParams.get('email');
    
    if (connected === 'google' || connected === 'microsoft') {
      const platform = connected === 'google' ? 'Google Calendar' : 'Microsoft Calendar';
      setSuccessMessage(`${platform} connected successfully${email ? ` for ${email}` : ''}`);
      // Remove query params
      setSearchParams({});
      // Refresh calendars
      if (profile?.id) {
        void fetchCalendars();
      }
    }
  }, [searchParams, setSearchParams, profile?.id]);

  // Handle OAuth callback redirects for export integrations (Slack, Notion, HubSpot)
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const team = searchParams.get('team');
    const workspace = searchParams.get('workspace');
    const portal = searchParams.get('portal');
    
    if (connected === 'slack') {
      setSuccessMessage(`Slack connected successfully${team ? ` to ${team}` : ''}`);
      setTimeout(() => setSearchParams({}), 100);
      if (profile?.id) {
        setTimeout(() => void fetchSlackStatus(), 500);
      }
    } else if (connected === 'notion') {
      setSuccessMessage(`Notion connected successfully${workspace ? ` to ${workspace}` : ''}`);
      setTimeout(() => setSearchParams({}), 100);
      if (profile?.id) {
        setTimeout(() => void fetchNotionStatus(), 500);
      }
    } else if (connected === 'hubspot') {
      setSuccessMessage(`HubSpot connected successfully${portal ? ` to ${portal}` : ''}`);
      setTimeout(() => setSearchParams({}), 100);
      if (profile?.id) {
        setTimeout(() => void fetchHubspotStatus(), 500);
      }
    } else if (error && (connected === 'slack' || connected === 'notion' || connected === 'hubspot')) {
      setError(`Failed to connect: ${error}`);
      setTimeout(() => setSearchParams({}), 100);
    }
  }, [searchParams, setSearchParams, profile?.id]);

  // Export integration handlers - define before useEffect that uses them
  const fetchSlackStatus = async (): Promise<void> => {
    if (!profile?.id) {
      setSlackStatus({ connected: false });
      return;
    }
    try {
      setError(null);
      const status = await getSlackStatus(profile.id);
      setSlackStatus(status);
    } catch (err) {
      console.error('Error fetching Slack status:', err);
      setSlackStatus({ connected: false });
    }
  };

  const fetchNotionStatus = async (): Promise<void> => {
    if (!profile?.id) {
      setNotionStatus({ connected: false });
      return;
    }
    try {
      setError(null);
      const status = await getNotionStatus(profile.id);
      setNotionStatus(status);
    } catch (err) {
      console.error('Error fetching Notion status:', err);
      setNotionStatus({ connected: false });
    }
  };

  const fetchHubspotStatus = async (): Promise<void> => {
    if (!profile?.id) {
      setHubspotStatus({ connected: false });
      return;
    }
    try {
      setError(null);
      const status = await getHubSpotStatus(profile.id);
      setHubspotStatus(status);
    } catch (err) {
      console.error('Error fetching HubSpot status:', err);
      setHubspotStatus({ connected: false });
    }
  };

  // Check export integration status on mount
  useEffect(() => {
    if (profile?.id) {
      void fetchSlackStatus();
      void fetchNotionStatus();
      void fetchHubspotStatus();
    } else if (!isProfileLoading) {
      setSlackStatus({ connected: false });
      setNotionStatus({ connected: false });
      setHubspotStatus({ connected: false });
    }
  }, [profile?.id, isProfileLoading]);

  const fetchCalendars = async () => {
    if (!profile?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('Fetching calendars for userId:', profile.id);
      const connected = await getConnectedCalendars(profile.id);
      console.log('Calendars fetched:', connected);
      setCalendars(connected);
      
      // Show ONLY live data for connected calendars (hide stored data from disconnected calendars)
      // Stored data will be available on a different page in the future
      const meetingsByCalendar = new Map<string, {
        calendarId: string;
        calendarName: string;
        calendarPlatform: string;
        calendarStatus: 'connected' | 'disconnected';
        events: Array<{
          id: string;
          title: string;
          start_time: string | null;
          end_time: string | null;
          meeting_url: string | null;
          should_record_manual: boolean | null;
          bots?: Array<{
            bot_id: string;
            join_at: string;
            created_at: string;
            status: string;
          }>;
          has_transcription?: boolean;
          has_summary?: boolean;
          has_action_items?: boolean;
        }>;
      }>();
      
      // Fetch LIVE data ONLY for connected calendars
      // Filter to only process calendars that are actually connected
      const connectedCalendars = connected.filter(cal => cal.connected === true);
      console.log(`Processing ${connectedCalendars.length} connected calendar(s) out of ${connected.length} total`);
      
      if (connectedCalendars.length > 0) {
        // Deduplicate by email/platform to avoid showing same calendar multiple times
        const seenCalendars = new Map<string, typeof connectedCalendars[0]>();
        for (const cal of connectedCalendars) {
          const key = `${cal.email || 'unknown'}_${cal.platform}`;
          // Keep the most recent calendar if duplicates exist
          if (!seenCalendars.has(key) || cal.id > seenCalendars.get(key)!.id) {
            seenCalendars.set(key, cal);
          }
        }
        
        const uniqueCalendars = Array.from(seenCalendars.values());
        console.log(`After deduplication: ${uniqueCalendars.length} unique calendar(s)`);
        
        const liveMeetingsPromises = uniqueCalendars.map(async (cal) => {
          try {
            const details = await getCalendarDetails(cal.id, profile.id);
            return {
              calendarId: cal.id,
              calendarName: cal.email || cal.platform,
              calendarPlatform: cal.platform,
              calendarStatus: 'connected' as const,
              events: details.events.map(event => ({
                id: event.id,
                title: event.title,
                start_time: event.start_time,
                end_time: event.end_time,
                meeting_url: event.meeting_url || null,
                should_record_manual: event.should_record_manual,
                bots: event.bots,
                has_transcription: false, // Live data doesn't include transcription flags
                has_summary: false,
                has_action_items: false,
              })),
            };
          } catch (err) {
            console.error(`Error fetching live details for calendar ${cal.id}:`, err);
            return null;
          }
        });
        
        const liveMeetings = await Promise.all(liveMeetingsPromises);
        for (const meeting of liveMeetings) {
          if (meeting) {
            // Use calendarId as key to avoid duplicates
            meetingsByCalendar.set(meeting.calendarId, meeting);
          }
        }
      }
      
      setAllMeetings(Array.from(meetingsByCalendar.values()));
    } catch (error) {
      console.error('Error fetching calendars:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to load calendar connections. Please check if VITE_RECALLAI_BASE_URL is configured.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Update refs with latest function references on every render
  useEffect(() => {
    fetchCalendarsRef.current = fetchCalendars;
  });
  
  useEffect(() => {
    handleViewCalendarRef.current = handleViewCalendar;
  });

  useEffect(() => {
    void fetchCalendars();
  }, [profile?.id]);

  // WebSocket connection for real-time calendar updates
  useEffect(() => {
    if (!profile?.id) {
      return;
    }

    // Get WebSocket URL from environment
    const recallaiBaseUrl = import.meta.env.VITE_RECALLAI_BASE_URL;
    if (!recallaiBaseUrl) {
      console.warn('VITE_RECALLAI_BASE_URL not set, WebSocket updates disabled');
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimeout: number | null = null;
    let isManualClose = false;

    const connectWebSocket = () => {
      // Convert https to wss, http to ws
      const wsUrl = recallaiBaseUrl
        .replace(/^https:/, 'wss:')
        .replace(/^http:/, 'ws:')
        .replace(/\/$/, '') + `/ws/calendar-updates?userId=${profile.id}`;

      console.log('Connecting to WebSocket for calendar updates:', wsUrl);
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected for calendar updates');
        setWsConnection(ws);
        // Clear any pending reconnect timeout
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          reconnectTimeout = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          
          if (data.type === 'calendar_update') {
            console.log('Received calendar update:', data.data);
            const updatedCalendarId = data.data?.calendar_id;
            const eventType = data.data?.event;
            
            // Refresh calendars and meetings when update is received
            // Use ref to get latest function reference (avoids stale closure)
            const fetchCalendarsFn = fetchCalendarsRef.current;
            const handleViewCalendarFn = handleViewCalendarRef.current;
            
            if (fetchCalendarsFn) {
              // For bot deletion events, add a small delay to ensure database is updated
              const delay = eventType === 'bots_deleted' || eventType === 'bot_deleted' ? 500 : 0;
              
              if (eventType === 'bots_deleted' || eventType === 'bot_deleted') {
                console.log('Bot deletion detected, refreshing calendar data...');
              }
              
              setTimeout(() => {
                // Check if profile is still available before fetching
                if (!profile?.id) {
                  console.warn('Profile not available, skipping calendar refresh');
                  return;
                }
                
                void fetchCalendarsFn().catch((error) => {
                  console.error('Error refreshing calendars after WebSocket update:', error);
                  // Don't show error to user for WebSocket-triggered refreshes
                  // The next manual refresh or page load will fix it
                }).then(() => {
                  console.log('Calendar data refreshed after WebSocket update');
                  // If viewing a calendar that was updated, refresh its details
                  // Use ref to get the latest selected calendar ID (avoid stale closure)
                  const currentSelectedId = selectedCalendarIdRef.current;
                  if (currentSelectedId && updatedCalendarId === currentSelectedId && handleViewCalendarFn) {
                    console.log('Refreshing calendar details for:', currentSelectedId);
                    // Small delay to ensure fetchCalendars completes
                    setTimeout(() => {
                      void handleViewCalendarFn(currentSelectedId).catch((error) => {
                        console.error('Error refreshing calendar details:', error);
                      });
                    }, 300);
                  }
                });
              }, delay);
            }
          } else if (data.type === 'pong') {
            // Keepalive response
            console.log('Received pong from server');
          } else {
            console.log('Unknown WebSocket message type:', data.type);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        setWsConnection(null);
        
        // Only reconnect if it wasn't a manual close and we still have a profile
        if (!isManualClose && profile?.id) {
          console.log('Attempting to reconnect WebSocket in 3 seconds...');
          reconnectTimeout = setTimeout(() => {
            if (profile?.id && !isManualClose) {
              connectWebSocket();
            }
          }, 3000);
        }
      };
    };

    // Initial connection
    connectWebSocket();

    // Cleanup on unmount
    return () => {
      isManualClose = true;
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
        ws.close();
      }
    };
  }, [profile?.id]);

  // Keepalive ping every 30 seconds
  useEffect(() => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      return;
    }

    const interval = setInterval(() => {
      if (wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [wsConnection]);

  const isConnected = (platform: 'google_calendar' | 'microsoft_outlook'): boolean => {
    return calendars.some((cal) => cal.platform === platform && cal.connected);
  };

  const getCalendarConnection = (
    platform: 'google_calendar' | 'microsoft_outlook'
  ): CalendarConnection | undefined => {
    return calendars.find((cal) => cal.platform === platform);
  };

  const handleConnect = async (integration: CalendarIntegration) => {
    if (!profile?.id) {
      setError('Please login to connect calendars');
      return;
    }

    setConnecting(integration.id);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get both URLs at once - simple like root_view
      const connectUrls = await getCalendarConnectUrls(profile.id);
      
      // Redirect to the appropriate OAuth provider
      const authUrl =
        integration.platform === 'google_calendar'
          ? connectUrls.googleCalendar
          : connectUrls.microsoftOutlook;

      if (!authUrl) {
        throw new Error('Failed to get authorization URL');
      }

      window.location.href = authUrl;
    } catch (error) {
      console.error('Error connecting calendar:', error);
      setError(error instanceof Error ? error.message : 'Failed to connect calendar');
      setConnecting(null);
    }
  };

  const handleViewCalendar = async (calendarId: string) => {
    if (!profile?.id) {
      setError('Please login to view calendar details');
      return;
    }

    setLoadingCalendarDetails(calendarId);
    setError(null);
    setSuccessMessage(null);

    try {
      const details = await getCalendarDetails(calendarId, profile.id);
      setSelectedCalendar(details);
      selectedCalendarIdRef.current = calendarId; // Update ref when calendar is viewed
    } catch (error) {
      console.error('Error fetching calendar details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load calendar details');
    } finally {
      setLoadingCalendarDetails(null);
    }
  };

  const handleCloseCalendarDetails = () => {
    setSelectedCalendar(null);
    selectedCalendarIdRef.current = null; // Clear ref when calendar details are closed
  };

  const handleUpdatePreferences = async (calendarId: string, preferences: {
    autoRecordExternalEvents: boolean;
    autoRecordOnlyConfirmedEvents: boolean;
  }) => {
    if (!profile?.id) {
      setError('Please login to update preferences');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await updateCalendarPreferences(calendarId, preferences, profile.id);

      // Refresh calendar details
      const details = await getCalendarDetails(calendarId, profile.id);
      setSelectedCalendar(details);
      setSuccessMessage('Recording preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
    }
  };

  const handleSyncEvents = async (calendarId: string) => {
    if (!profile?.id) {
      setError('Please login to sync events');
      return;
    }

    setSyncingCalendar(calendarId);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await syncCalendarEvents(calendarId, profile.id);
      setSuccessMessage(result.message);

      // Refresh calendar details
      const details = await getCalendarDetails(calendarId, profile.id);
      setSelectedCalendar(details);
    } catch (error) {
      console.error('Error syncing events:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync events');
    } finally {
      setSyncingCalendar(null);
    }
  };

  const handleSetManualRecord = async (eventId: string, manualRecord: boolean | null) => {
    if (!profile?.id || !selectedCalendar) {
      return;
    }

    try {
      await setEventManualRecord(eventId, manualRecord, profile.id);

      // Refresh calendar details
      const details = await getCalendarDetails(selectedCalendar.id, profile.id);
      setSelectedCalendar(details);
      
      // Refresh all meetings
      await fetchCalendars();
    } catch (error) {
      console.error('Error setting manual record:', error);
      setError(error instanceof Error ? error.message : 'Failed to set manual record');
    }
  };

  const handleCreateBotForEvent = async (eventId: string) => {
    if (!profile?.id) {
      setError('Please login to create bots');
      return;
    }

    setCreatingBot(eventId);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await createBotForEvent(eventId, profile.id);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Bot created successfully');
        // Refresh calendar details if viewing a calendar
        if (selectedCalendar) {
          const details = await getCalendarDetails(selectedCalendar.id, profile.id);
          setSelectedCalendar(details);
        }
        // Refresh all meetings
        await fetchCalendars();
      } else {
        setError(result.error || 'Failed to create bot');
      }
    } catch (error) {
      console.error('Error creating bot:', error);
      setError(error instanceof Error ? error.message : 'Failed to create bot');
    } finally {
      setCreatingBot(null);
    }
  };

  const handleDeleteBotForEvent = async (eventId: string, botId: string) => {
    if (!profile?.id) {
      setError('Please login to delete bots');
      return;
    }

    if (!confirm('Are you sure you want to delete this scheduled bot?')) {
      return;
    }

    setDeletingBot(botId);
    setError(null);
    setSuccessMessage(null);

    try {
      const result = await deleteBotForEvent(eventId, botId, profile.id);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Bot deleted successfully');
        // Refresh calendar details if viewing a calendar
        if (selectedCalendar) {
          const details = await getCalendarDetails(selectedCalendar.id, profile.id);
          setSelectedCalendar(details);
        }
        // Refresh all meetings
        await fetchCalendars();
      } else {
        setError(result.error || 'Failed to delete bot');
      }
    } catch (error) {
      console.error('Error deleting bot:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete bot');
    } finally {
      setDeletingBot(null);
    }
  };

  const handleDisconnect = async (integration: CalendarIntegration) => {
    const connection = getCalendarConnection(integration.platform);
    if (!connection) return;

    if (!profile?.id) {
      setError('Please login to disconnect calendars');
      return;
    }

    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      await disconnectCalendar(connection.id, profile.id);

      // Refresh calendar list and meetings
      await fetchCalendars();
      setSuccessMessage(`${integration.name} disconnected successfully`);
      
      // Close calendar details if it was open
      if (selectedCalendar?.id === connection.id) {
        setSelectedCalendar(null);
        selectedCalendarIdRef.current = null; // Clear ref when calendar is closed
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect calendar');
    }
  };

  const handleExportConnect = async (integration: ExportIntegration): Promise<void> => {
    if (!profile?.id) {
      setError(`Please log in to connect ${integration.name}`);
      return;
    }
    try {
      setExportConnecting(integration.id);
      setError(null);
      if (integration.id === 'slack') {
        const authUrl = await getSlackConnectUrl(profile.id);
        window.location.href = authUrl;
      } else if (integration.id === 'notion') {
        const authUrl = await getNotionConnectUrl(profile.id);
        window.location.href = authUrl;
      } else if (integration.id === 'hubspot') {
        const authUrl = await getHubSpotConnectUrl(profile.id);
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error(`Error connecting to ${integration.name}:`, err);
      setError(err instanceof Error ? err.message : `Failed to connect to ${integration.name}`);
      setExportConnecting(null);
    }
  };

  const handleExportDisconnect = async (integration: ExportIntegration): Promise<void> => {
    if (!profile?.id) {
      setError(`Please log in to disconnect ${integration.name}`);
      return;
    }
    if (!confirm(`Are you sure you want to disconnect from ${integration.name}?`)) {
      return;
    }
    try {
      setError(null);
      if (integration.id === 'slack') {
        await disconnectSlack(profile.id);
        setSuccessMessage('Successfully disconnected from Slack');
        setSlackStatus({ connected: false });
        void fetchSlackStatus();
      } else if (integration.id === 'notion') {
        await disconnectNotion(profile.id);
        setSuccessMessage('Successfully disconnected from Notion');
        setNotionStatus({ connected: false });
        void fetchNotionStatus();
      } else if (integration.id === 'hubspot') {
        await disconnectHubSpot(profile.id);
        setSuccessMessage('Successfully disconnected from HubSpot');
        setHubspotStatus({ connected: false });
        void fetchHubspotStatus();
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(`Error disconnecting from ${integration.name}:`, err);
      setError(err instanceof Error ? err.message : `Failed to disconnect from ${integration.name}`);
    }
  };

  return (
    <DashboardLayout activeTab="/integrations">
      <div className="w-full min-h-full bg-white">
        <div className="px-4 py-4 md:px-6 md:py-6 lg:px-8 lg:py-8">
          {/* Breadcrumb */}
          <nav className="mb-3 md:mb-4" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2 font-nunito text-xs font-semibold text-ellieGray uppercase tracking-wider">
              <li>
                <a href="/dashboard" className="hover:text-ellieBlack transition-colors">
                  Dashboard
                </a>
              </li>
              <li className="text-ellieGray">/</li>
              <li className="text-ellieBlue">Integrations</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack mb-4 md:mb-6 lg:mb-8">
            Integrations
          </h1>

          {/* Error Message */}
          {error && (
            <div className="mb-4 md:mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 font-nunito text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 md:mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 font-nunito text-sm text-green-600">
              {successMessage}
            </div>
          )}

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Calendar Integrations */}
            {CALENDAR_INTEGRATIONS.map((integration) => {
              const connected = isConnected(integration.platform);
              const connection = getCalendarConnection(integration.platform);
              const isConnecting = connecting === integration.id;

              return (
                <div
                  key={integration.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  {/* Integration Logo */}
                  <div className="mb-3 md:mb-4 flex items-center justify-center h-12 md:h-16">
                    <img
                      src={integration.icon}
                      alt={`${integration.name} logo`}
                      className="max-h-12 md:max-h-16 max-w-full object-contain"
                    />
                  </div>

                  {/* Integration Name */}
                  <h3 className="font-nunito text-base md:text-lg font-bold text-ellieBlack mb-2 text-center">
                    {integration.name}
                  </h3>

                  {/* Integration Description */}
                  <p className="font-nunito text-xs md:text-sm text-ellieGray mb-4 md:mb-6 leading-relaxed">
                    {integration.description}
                  </p>

                  {/* Connection Status */}
                  {connected && connection?.email && (
                    <p className="font-nunito text-xs text-ellieGray mb-3 text-center">
                      Connected as: {connection.email}
                    </p>
                  )}

                  {/* Connect/Disconnect Section */}
                  <div className="flex flex-col gap-2">
                    {connected ? (
                      <>
                        <button
                          type="button"
                          onClick={() => connection && handleViewCalendar(connection.id)}
                          disabled={loadingCalendarDetails === connection?.id}
                          className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loadingCalendarDetails === connection?.id ? (
                            'Loading...'
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 md:w-5 md:h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              View Details
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDisconnect(integration)}
                          className="text-red-500 font-nunito text-xs md:text-sm font-medium hover:text-red-600 transition-colors text-center"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(integration)}
                        disabled={isConnecting || isLoading}
                        className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isConnecting ? 'Connecting...' : 'Connect'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {/* Export Integrations */}
            {EXPORT_INTEGRATIONS.map((integration) => {
                const isSlack = integration.id === 'slack';
                const isNotion = integration.id === 'notion';
                const isHubspot = integration.id === 'hubspot';
                const isConnected = (isSlack && slackStatus.connected) || (isNotion && notionStatus.connected) || (isHubspot && hubspotStatus.connected);
                const isConnecting = exportConnecting === integration.id;

                return (
                  <div
                    key={integration.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Integration Logo */}
                    <div className="mb-3 md:mb-4 flex items-center justify-center h-12 md:h-16">
                      {integration.icon ? (
                        <img
                          src={integration.icon}
                          alt={`${integration.name} logo`}
                          className="max-h-12 md:max-h-16 max-w-full object-contain"
                        />
                      ) : (
                        <div
                          className="text-2xl md:text-3xl font-bold"
                          style={{ color: integration.iconColor || '#333' }}
                        >
                          {integration.name}
                        </div>
                      )}
                    </div>

                    {/* Integration Name */}
                    <h3 className="font-nunito text-base md:text-lg font-bold text-ellieBlack mb-2 text-center">
                      {integration.name}
                    </h3>

                    {/* Integration Description */}
                    <p className="font-nunito text-xs md:text-sm text-ellieGray mb-4 md:mb-6 leading-relaxed">
                      {integration.description}
                    </p>

                    {/* Connection Status */}
                    {isSlack && isConnected && slackStatus.team_name && (
                      <p className="font-nunito text-xs text-ellieGray mb-3 text-center">
                        Connected to: {slackStatus.team_name}
                      </p>
                    )}
                    {isNotion && isConnected && notionStatus.workspace_name && (
                      <p className="font-nunito text-xs text-ellieGray mb-3 text-center">
                        Connected to: {notionStatus.workspace_name}
                      </p>
                    )}
                    {isHubspot && isConnected && hubspotStatus.portal_name && (
                      <p className="font-nunito text-xs text-ellieGray mb-3 text-center">
                        Connected to: {hubspotStatus.portal_name}
                      </p>
                    )}

                    {/* Connect/Disconnect Button */}
                    <div className="flex flex-col gap-2">
                      {isConnected ? (
                        <>
                          <button
                            type="button"
                            disabled={isLoading}
                            className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-green-600 text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-4 h-4 md:w-5 md:h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            Connected
                          </button>
                          <button
                            type="button"
                            onClick={() => handleExportDisconnect(integration)}
                            disabled={isLoading}
                            className="text-red-500 font-nunito text-xs md:text-sm font-medium hover:text-red-600 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Disconnect
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleExportConnect(integration)}
                          disabled={isConnecting || isLoading}
                          className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isConnecting ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>

          {/* All Meetings from All Calendars */}
          {allMeetings.length > 0 && (
            <div className="mt-8 md:mt-10">
              <h2 className="font-spaceGrotesk text-xl md:text-2xl font-bold text-ellieBlack mb-4 md:mb-6">
                All Meetings
              </h2>
              <div className="space-y-6">
                {allMeetings.map((calendarMeetings) => (
                  <div key={calendarMeetings.calendarId} className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-md">
                    <h3 className="font-nunito text-lg font-bold text-ellieBlack mb-4">
                      {calendarMeetings.calendarName} ({calendarMeetings.calendarPlatform === 'google_calendar' ? 'Google' : 'Microsoft'})
                    </h3>
                    {calendarMeetings.events.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                Title
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                Start Time
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                End Time
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                Meeting URL
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                Status
                              </th>
                              <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {calendarMeetings.events.map((event) => {
                              const startTime = event.start_time ? new Date(event.start_time) : null;
                              const endTime = event.end_time ? new Date(event.end_time) : null;
                              const now = new Date();
                              let status = '-';
                              let statusColor = 'text-ellieGray';
                              const isPast = startTime && endTime && endTime < now;
                              const isFuture = startTime && startTime > now;
                              const hasBot = (event as any).bots && Array.isArray((event as any).bots) && (event as any).bots.length > 0;

                              if (startTime && endTime) {
                                if (startTime > now) {
                                  status = 'Upcoming';
                                  statusColor = 'text-blue-600 font-bold';
                                } else if (endTime > now) {
                                  status = '🔴 Live Now';
                                  statusColor = 'text-green-600 font-bold';
                                } else {
                                  status = 'Completed';
                                  statusColor = 'text-gray-500';
                                }
                              }

                              return (
                                <tr key={event.id} className="hover:bg-gray-50">
                                  <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieBlack font-semibold">
                                    {event.title}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieGray">
                                    {startTime
                                      ? startTime.toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : 'N/A'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieGray">
                                    {endTime
                                      ? endTime.toLocaleString('en-US', {
                                          year: 'numeric',
                                          month: '2-digit',
                                          day: '2-digit',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : 'N/A'}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 font-nunito text-xs">
                                    {event.meeting_url ? (
                                      <a
                                        href={event.meeting_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-ellieBlue hover:underline"
                                      >
                                        Join
                                      </a>
                                    ) : (
                                      'N/A'
                                    )}
                                  </td>
                                  <td className={`border border-gray-300 px-3 py-2 font-nunito text-xs ${statusColor}`}>
                                    {status}
                                  </td>
                                  <td className="border border-gray-300 px-3 py-2 font-nunito text-xs">
                                    {/* Only show Create Bot for past/completed meetings without bots */}
                                    {event.meeting_url && isPast && !hasBot && (
                                      <button
                                        type="button"
                                        onClick={() => handleCreateBotForEvent(event.id)}
                                        disabled={creatingBot === event.id}
                                        className="px-2 py-1 rounded bg-ellieBlue text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {creatingBot === event.id ? 'Creating...' : 'Create Bot'}
                                      </button>
                                    )}
                                    {/* Show status for future meetings (bots are auto-created) */}
                                    {isFuture && hasBot && (
                                      <div className="flex flex-col gap-1">
                                        <span className="text-green-600 font-semibold">Bot Scheduled</span>
                                        {event.bots && event.bots.length > 0 && event.bots.map((bot: any) => {
                                          const botId = bot.bot_id || bot.id;
                                          return (
                                            <button
                                              key={botId}
                                              type="button"
                                              onClick={() => handleDeleteBotForEvent(event.id, botId)}
                                              disabled={deletingBot === botId}
                                              className="px-2 py-1 rounded bg-red-500 text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                              {deletingBot === botId ? 'Deleting...' : 'Delete Bot'}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    )}
                                    {isFuture && !hasBot && (
                                      <span className="text-blue-600">Bot will be created automatically</span>
                                    )}
                                    {/* Show status for past meetings */}
                                    {isPast && hasBot && (
                                      <span className="text-green-600 font-semibold">Bot Created</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="font-nunito text-sm text-ellieGray">
                        No events found. Click "View Details" and then "Sync Events" to fetch events from this calendar.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar Details Modal/Expanded View */}
          {selectedCalendar && (
            <div className="mt-6 md:mt-8 bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-spaceGrotesk text-xl md:text-2xl font-bold text-ellieBlack">
                  Calendar Details
                </h2>
                <button
                  type="button"
                  onClick={handleCloseCalendarDetails}
                  className="text-ellieGray hover:text-ellieBlack transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Calendar Info */}
              <div className="mb-6 space-y-2">
                <p className="font-nunito text-sm text-ellieGray">
                  <strong>Platform:</strong> {selectedCalendar.platform === 'google_calendar' ? 'Google Calendar' : 'Microsoft Outlook'}
                </p>
                <p className="font-nunito text-sm text-ellieGray">
                  <strong>Email:</strong> {selectedCalendar.email || 'N/A'}
                </p>
                <p className="font-nunito text-sm text-ellieGray">
                  <strong>Status:</strong> {selectedCalendar.status || 'connecting'}
                </p>
              </div>

              {/* Recording Preferences */}
              <div className="mb-6">
                <h3 className="font-nunito text-lg font-bold text-ellieBlack mb-3">
                  Recording Preferences
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleUpdatePreferences(selectedCalendar.id, {
                      autoRecordExternalEvents: formData.get('autoRecordExternalEvents') === 'on',
                      autoRecordOnlyConfirmedEvents: formData.get('autoRecordOnlyConfirmedEvents') === 'on',
                    });
                  }}
                  className="space-y-3"
                >
                  <label className="flex items-center gap-2 font-nunito text-sm text-ellieBlack">
                    <input
                      type="checkbox"
                      name="autoRecordExternalEvents"
                      defaultChecked={selectedCalendar.auto_record_external_events}
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    Auto Record External Events
                  </label>
                  <label className="flex items-center gap-2 font-nunito text-sm text-ellieBlack">
                    <input
                      type="checkbox"
                      name="autoRecordOnlyConfirmedEvents"
                      defaultChecked={selectedCalendar.auto_record_only_confirmed_events}
                      className="w-4 h-4 text-ellieBlue border-gray-300 rounded focus:ring-ellieBlue"
                    />
                    Auto Record Only Confirmed Events
                  </label>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-ellieBlue text-white font-nunito text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    Update Preferences
                  </button>
                </form>
              </div>

              {/* Events */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-nunito text-lg font-bold text-ellieBlack">Events</h3>
                  <button
                    type="button"
                    onClick={() => handleSyncEvents(selectedCalendar.id)}
                    disabled={syncingCalendar === selectedCalendar.id}
                    className="px-3 py-1.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {syncingCalendar === selectedCalendar.id ? 'Syncing...' : 'Sync Events'}
                  </button>
                </div>
                {selectedCalendar.events.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Title
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Start Time
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            End Time
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Meeting URL
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Status
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCalendar.events.map((event) => {
                          const startTime = event.start_time ? new Date(event.start_time) : null;
                          const endTime = event.end_time ? new Date(event.end_time) : null;
                          const now = new Date();
                          let status = '-';
                          let statusColor = 'text-ellieGray';
                          const isPast = startTime && endTime && endTime < now;
                          const isFuture = startTime && startTime > now;
                          const hasBot = (event as any).bots && Array.isArray((event as any).bots) && (event as any).bots.length > 0;

                          if (startTime && endTime) {
                            if (startTime > now) {
                              status = 'Upcoming';
                              statusColor = 'text-blue-600 font-bold';
                            } else if (endTime > now) {
                              status = '🔴 Live Now';
                              statusColor = 'text-green-600 font-bold';
                            } else {
                              status = 'Completed';
                              statusColor = 'text-gray-500';
                            }
                          }

                          return (
                            <tr key={event.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieBlack font-semibold">
                                {event.title}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieGray">
                                {startTime
                                  ? startTime.toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'N/A'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieGray">
                                {endTime
                                  ? endTime.toLocaleString('en-US', {
                                      year: 'numeric',
                                      month: '2-digit',
                                      day: '2-digit',
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })
                                  : 'N/A'}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs">
                                {event.meeting_url ? (
                                  <a
                                    href={event.meeting_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-ellieBlue hover:underline"
                                  >
                                    Join
                                  </a>
                                ) : (
                                  'N/A'
                                )}
                              </td>
                              <td className={`border border-gray-300 px-3 py-2 font-nunito text-xs ${statusColor}`}>
                                {status}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs">
                                <div className="flex flex-col gap-2">
                                  <select
                                    value={
                                      event.should_record_manual === true
                                        ? 'true'
                                        : event.should_record_manual === false
                                          ? 'false'
                                          : ''
                                    }
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      handleSetManualRecord(
                                        event.id,
                                        value === 'true' ? true : value === 'false' ? false : null
                                      );
                                    }}
                                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                  >
                                    <option value="">Not Set</option>
                                    <option value="true">Record</option>
                                    <option value="false">Don't Record</option>
                                  </select>
                                  {/* Only show Create Bot for past/completed meetings without bots */}
                                  {event.meeting_url && isPast && !hasBot && (
                                    <button
                                      type="button"
                                      onClick={() => handleCreateBotForEvent(event.id)}
                                      disabled={creatingBot === event.id}
                                      className="px-2 py-1 rounded bg-ellieBlue text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {creatingBot === event.id ? 'Creating...' : 'Create Bot'}
                                    </button>
                                  )}
                                  {/* Show status for future meetings (bots are auto-created) */}
                                  {isFuture && hasBot && (
                                    <div className="flex flex-col gap-1">
                                      <span className="text-green-600 font-semibold text-xs">Bot Scheduled</span>
                                      {event.bots && event.bots.length > 0 && event.bots.map((bot: any) => {
                                        const botId = bot.bot_id || bot.id;
                                        return (
                                          <button
                                            key={botId}
                                            type="button"
                                            onClick={() => handleDeleteBotForEvent(event.id, botId)}
                                            disabled={deletingBot === botId}
                                            className="px-2 py-1 rounded bg-red-500 text-white font-nunito text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            {deletingBot === botId ? 'Deleting...' : 'Delete Bot'}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                  {isFuture && !hasBot && (
                                    <span className="text-blue-600 text-xs">Bot will be created automatically</span>
                                  )}
                                  {/* Show status for past meetings */}
                                  {isPast && hasBot && (
                                    <span className="text-green-600 font-semibold text-xs">Bot Created</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="font-nunito text-sm text-ellieGray">
                    No events found. Click "Sync Events" button above to fetch events from your calendar.
                  </p>
                )}
              </div>

              {/* Webhooks */}
              <div className="mb-6">
                <h3 className="font-nunito text-lg font-bold text-ellieBlack mb-3">Webhooks</h3>
                {selectedCalendar.webhooks.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Event
                          </th>
                          <th className="border border-gray-300 px-3 py-2 text-left font-nunito text-xs font-semibold text-ellieBlack">
                            Received At
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedCalendar.webhooks.map((webhook) => {
                          const receivedAt = new Date(webhook.received_at);
                          return (
                            <tr key={webhook.id} className="hover:bg-gray-50">
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieBlack">
                                {webhook.event}
                              </td>
                              <td className="border border-gray-300 px-3 py-2 font-nunito text-xs text-ellieGray">
                                {receivedAt.toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: '2-digit',
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  second: '2-digit',
                                })}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="font-nunito text-sm text-ellieGray">No webhooks received yet.</p>
                )}
              </div>

              {/* Delete Calendar */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    const integration = CALENDAR_INTEGRATIONS.find(
                      (i) => i.platform === selectedCalendar.platform
                    );
                    if (integration && confirm('Are you sure you want to delete this calendar?')) {
                      handleDisconnect(integration);
                    }
                  }}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-nunito text-sm font-semibold hover:bg-red-600 transition-colors"
                >
                  Delete Calendar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

