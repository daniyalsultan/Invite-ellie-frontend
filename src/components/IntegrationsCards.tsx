import React from 'react';
import googleMeetIcon from '../assets/integration-google-meet.svg';
import zoomIcon from '../assets/integration-zoom.svg';
import microsoftTeamsIcon from '../assets/integration-microsoft-teams.svg';

const INTEGRATIONS = [
  { name: 'Google Meet', icon: googleMeetIcon },
  { name: 'Zoom', icon: zoomIcon },
  { name: 'Microsoft Teams', icon: microsoftTeamsIcon },
];

export function IntegrationsCards(): JSX.Element {
  return (
    <section id="integrations-cards" className="w-full py-12 md:py-16" aria-labelledby="integrations-cards-heading">
      <div className="container-ellie">
        <h2 id="integrations-cards-heading" className="text-[28px] md:text-[36px] font-extrabold text-ellieBlack mb-3">Integrations made Easy!</h2>
        <p className="text-ellieGray max-w-[740px] mb-8">Ellie works with your existing meeting platforms such as Google Meet, Zoom, and Microsoft Teams to capture and remember context across every conversation.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {INTEGRATIONS.map((integration) => (
            <div key={integration.name} className="rounded-[5px] bg-white shadow-sm border border-black/5 p-5 flex items-center gap-3">
              <img src={integration.icon} alt={`${integration.name} icon`} className="h-8 w-auto" />
              <span className="text-ellieBlack text-[18px] font-semibold">{integration.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


