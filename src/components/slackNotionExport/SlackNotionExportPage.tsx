import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '../sidebar';
import { useProfile } from '../../context/ProfileContext';
import { getSlackConnectUrl, getSlackStatus, disconnectSlack, type SlackConnectionStatus } from '../../services/slackApi';
import { getNotionConnectUrl, getNotionStatus, disconnectNotion, type NotionConnectionStatus } from '../../services/notionApi';
import slackLogo from '../../assets/Slack-Logo.png';
import notionLogo from '../../assets/notion_logo.png';

interface ExportIntegration {
  id: 'slack' | 'notion';
  name: string;
  icon: string;
  description: string;
}

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
];

export function SlackNotionExportPage(): JSX.Element {
  const { profile } = useProfile();
  const [searchParams, setSearchParams] = useSearchParams();
  const [slackStatus, setSlackStatus] = useState<SlackConnectionStatus>({ connected: false });
  const [notionStatus, setNotionStatus] = useState<NotionConnectionStatus>({ connected: false });
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<'slack' | 'notion' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check connection status on mount
  useEffect(() => {
    if (profile?.id) {
      void fetchSlackStatus();
      void fetchNotionStatus();
    } else {
      setIsLoading(false);
    }
  }, [profile?.id]);

  // Handle OAuth callback redirects
  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    const team = searchParams.get('team');
    const workspace = searchParams.get('workspace');
    
    if (connected === 'slack') {
      setSuccessMessage(`Slack connected successfully${team ? ` to ${team}` : ''}`);
      setSearchParams({});
      // Refresh status
      if (profile?.id) {
        void fetchSlackStatus();
      }
    } else if (connected === 'notion') {
      setSuccessMessage(`Notion connected successfully${workspace ? ` to ${workspace}` : ''}`);
      setSearchParams({});
      // Refresh status
      if (profile?.id) {
        void fetchNotionStatus();
      }
    } else if (error) {
      setError(`Failed to connect: ${error}`);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams, profile?.id]);

  const fetchSlackStatus = async (): Promise<void> => {
    if (!profile?.id) {
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
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const status = await getNotionStatus(profile.id);
      setNotionStatus(status);
    } catch (err) {
      console.error('Error fetching Notion status:', err);
      setNotionStatus({ connected: false });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnect = async (integration: ExportIntegration): Promise<void> => {
    if (!profile?.id) {
      setError(`Please log in to connect ${integration.name}`);
      return;
    }

    try {
      setConnecting(integration.id);
      setError(null);

      if (integration.id === 'slack') {
        const authUrl = await getSlackConnectUrl(profile.id);
        // Redirect to Slack OAuth
        window.location.href = authUrl;
      } else if (integration.id === 'notion') {
        const authUrl = await getNotionConnectUrl(profile.id);
        // Redirect to Notion OAuth
        window.location.href = authUrl;
      }
    } catch (err) {
      console.error(`Error connecting to ${integration.name}:`, err);
      setError(err instanceof Error ? err.message : `Failed to connect to ${integration.name}`);
      setConnecting(null);
    }
  };

  const handleDisconnect = async (integration: ExportIntegration): Promise<void> => {
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
      } else if (integration.id === 'notion') {
        await disconnectNotion(profile.id);
        setSuccessMessage('Successfully disconnected from Notion');
        setNotionStatus({ connected: false });
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(`Error disconnecting from ${integration.name}:`, err);
      setError(err instanceof Error ? err.message : `Failed to disconnect from ${integration.name}`);
    }
  };

  return (
    <DashboardLayout activeTab="/slack-notion-export">
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
              <li className="text-ellieBlue">Slack Notion Export</li>
            </ol>
          </nav>

          {/* Page Title */}
          <h1 className="font-spaceGrotesk text-2xl md:text-3xl lg:text-4xl font-bold text-ellieBlack mb-4 md:mb-6 lg:mb-8">
            Slack Notion Export
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
            {EXPORT_INTEGRATIONS.map((integration) => {
              const isSlack = integration.id === 'slack';
              const isNotion = integration.id === 'notion';
              const isConnected = (isSlack && slackStatus.connected) || (isNotion && notionStatus.connected);
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
                          onClick={() => handleDisconnect(integration)}
                          disabled={isLoading}
                          className="text-red-500 font-nunito text-xs md:text-sm font-medium hover:text-red-600 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
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
        </div>
      </div>
    </DashboardLayout>
  );
}

