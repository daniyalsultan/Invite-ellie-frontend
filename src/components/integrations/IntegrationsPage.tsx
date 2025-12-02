import { useState, useEffect } from 'react';
import { DashboardLayout } from '../sidebar';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import {
  getConnectedCalendars,
  getCalendarConnectUrls,
  disconnectCalendar,
  getCalendarDetails,
  updateCalendarPreferences,
  syncCalendarEvents,
  setEventManualRecord,
  CalendarConnection,
  CalendarDetails,
} from '../../services/calendarApi';
import googleMeetIcon from '../../assets/integration-google-meet.svg';
import microsoftTeamsIcon from '../../assets/integration-microsoft-teams.svg';

interface CalendarIntegration {
  id: 'google' | 'microsoft';
  name: string;
  icon: string;
  description: string;
  platform: 'google_calendar' | 'microsoft_outlook';
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

export function IntegrationsPage(): JSX.Element {
  const { ensureFreshAccessToken, session } = useAuth();
  const { profile } = useProfile();
  const [calendars, setCalendars] = useState<CalendarConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<'google' | 'microsoft' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedCalendar, setSelectedCalendar] = useState<CalendarDetails | null>(null);
  const [loadingCalendarDetails, setLoadingCalendarDetails] = useState<string | null>(null);
  const [syncingCalendar, setSyncingCalendar] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendars = async () => {
      if (!session?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        const token = await ensureFreshAccessToken();
        if (token) {
          console.log('Fetching calendars with token...');
          const connected = await getConnectedCalendars(token, profile?.id);
          console.log('Calendars fetched:', connected);
          setCalendars(connected);
        }
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

    void fetchCalendars();
  }, [session, ensureFreshAccessToken, profile?.id]);

  const isConnected = (platform: 'google_calendar' | 'microsoft_outlook'): boolean => {
    return calendars.some((cal) => cal.platform === platform && cal.connected);
  };

  const getCalendarConnection = (
    platform: 'google_calendar' | 'microsoft_outlook'
  ): CalendarConnection | undefined => {
    return calendars.find((cal) => cal.platform === platform);
  };

  const handleConnect = async (integration: CalendarIntegration) => {
    if (!session?.accessToken || !profile?.id) {
      setError('Please login to connect calendars');
      return;
    }

    setConnecting(integration.id);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      // Get both URLs at once - simple like root_view
      const connectUrls = await getCalendarConnectUrls(token, profile.id);
      
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
    if (!session?.accessToken) {
      setError('Please login to view calendar details');
      return;
    }

    setLoadingCalendarDetails(calendarId);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      const details = await getCalendarDetails(token, calendarId);
      setSelectedCalendar(details);
    } catch (error) {
      console.error('Error fetching calendar details:', error);
      setError(error instanceof Error ? error.message : 'Failed to load calendar details');
    } finally {
      setLoadingCalendarDetails(null);
    }
  };

  const handleCloseCalendarDetails = () => {
    setSelectedCalendar(null);
  };

  const handleUpdatePreferences = async (calendarId: string, preferences: {
    autoRecordExternalEvents: boolean;
    autoRecordOnlyConfirmedEvents: boolean;
  }) => {
    if (!session?.accessToken) {
      setError('Please login to update preferences');
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      await updateCalendarPreferences(token, calendarId, preferences);

      // Refresh calendar details
      const details = await getCalendarDetails(token, calendarId);
      setSelectedCalendar(details);
      setSuccessMessage('Recording preferences updated successfully');
    } catch (error) {
      console.error('Error updating preferences:', error);
      setError(error instanceof Error ? error.message : 'Failed to update preferences');
    }
  };

  const handleSyncEvents = async (calendarId: string) => {
    if (!session?.accessToken) {
      setError('Please login to sync events');
      return;
    }

    setSyncingCalendar(calendarId);
    setError(null);
    setSuccessMessage(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      const result = await syncCalendarEvents(token, calendarId);
      setSuccessMessage(result.message);

      // Refresh calendar details
      const details = await getCalendarDetails(token, calendarId);
      setSelectedCalendar(details);
    } catch (error) {
      console.error('Error syncing events:', error);
      setError(error instanceof Error ? error.message : 'Failed to sync events');
    } finally {
      setSyncingCalendar(null);
    }
  };

  const handleSetManualRecord = async (eventId: string, manualRecord: boolean | null) => {
    if (!session?.accessToken || !selectedCalendar) {
      return;
    }

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      await setEventManualRecord(token, eventId, manualRecord);

      // Refresh calendar details
      const details = await getCalendarDetails(token, selectedCalendar.id);
      setSelectedCalendar(details);
    } catch (error) {
      console.error('Error setting manual record:', error);
      setError(error instanceof Error ? error.message : 'Failed to set manual record');
    }
  };

  const handleDisconnect = async (integration: CalendarIntegration) => {
    const connection = getCalendarConnection(integration.platform);
    if (!connection) return;

    if (!session?.accessToken) {
      setError('Please login to disconnect calendars');
      return;
    }

    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    setError(null);
    setSuccessMessage(null);

    try {
      const token = await ensureFreshAccessToken();
      if (!token) {
        throw new Error('Unable to authenticate');
      }

      await disconnectCalendar(token, connection.id);

      // Refresh calendar list
      const connected = await getConnectedCalendars(token);
      setCalendars(connected);
      setSuccessMessage(`${integration.name} disconnected successfully`);
      
      // Close calendar details if it was open
      if (selectedCalendar?.id === connection.id) {
        setSelectedCalendar(null);
      }
    } catch (error) {
      console.error('Error disconnecting calendar:', error);
      setError(error instanceof Error ? error.message : 'Failed to disconnect calendar');
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
          </div>

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

