import { useState } from 'react';
import { DashboardLayout } from '../sidebar';
import zoomIcon from '../../assets/integration-zoom.svg';
import googleMeetIcon from '../../assets/integration-google-meet.svg';
import microsoftTeamsIcon from '../../assets/integration-microsoft-teams.svg';
import slackIcon from '../../assets/trusted-slack.svg';
import notionIcon from '../../assets/trusted-notion.svg';
import hubspotIcon from '../../assets/trusted-hubshot.svg';

interface Integration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
}

export function IntegrationsPage(): JSX.Element {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'zoom',
      name: 'Zoom',
      icon: zoomIcon,
      description: 'Connect Zoom to automatically capture meeting transcripts and summaries here.',
      connected: true,
    },
    {
      id: 'google-meet',
      name: 'Google Meet',
      icon: googleMeetIcon,
      description: 'Connect Google Meet so Ellie can help take notes and remember your important discussions.',
      connected: false,
    },
    {
      id: 'microsoft-teams',
      name: 'Microsoft Teams',
      icon: microsoftTeamsIcon,
      description: 'Connect Microsoft Teams to keep your meeting insights organized in one place.',
      connected: false,
    },
    {
      id: 'slack',
      name: 'Slack',
      icon: slackIcon,
      description: 'Enable Slack to share updates and meeting summaries with your team instantly.',
      connected: true,
    },
    {
      id: 'notion',
      name: 'Notion',
      icon: notionIcon,
      description: 'Connect Notion to organize your meeting notes and action items in one workspace.',
      connected: false,
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: hubspotIcon,
      description: 'Connect HubSpot to sync conversations and keep track of customer updates.',
      connected: false,
    },
  ]);

  const handleConnect = (id: string): void => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, connected: true } : integration
      )
    );
  };

  const handleDisconnect = (id: string): void => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, connected: false } : integration
      )
    );
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

          {/* Integration Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {integrations.map((integration) => (
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

                {/* Integration Description */}
                <p className="font-nunito text-xs md:text-sm text-ellieGray mb-4 md:mb-6 leading-relaxed">
                  {integration.description}
                </p>

                {/* Connect/Disconnect Section */}
                <div className="flex flex-col gap-2">
                  {integration.connected ? (
                    <>
                      <button
                        type="button"
                        className="flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity"
                        disabled
                      >
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
                        Connected
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDisconnect(integration.id)}
                        className="text-red-500 font-nunito text-xs md:text-sm font-medium hover:text-red-600 transition-colors text-center"
                      >
                        Disconnect
                      </button>
                    </> 
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleConnect(integration.id)}
                      className="px-3 md:px-4 py-2 md:py-2.5 rounded-lg bg-ellieBlue text-white font-nunito text-xs md:text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

