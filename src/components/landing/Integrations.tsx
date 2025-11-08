// import React from 'react';
import googleMeetIcon from '../../assets/integration-google-meet.svg';
import zoomIcon from '../../assets/integration-zoom.svg';
import microsoftTeamsIcon from '../../assets/integration-microsoft-teams.svg';

const INTEGRATIONS = [
  { name: 'Google Meet', icon: googleMeetIcon },
  { name: 'Zoom', icon: zoomIcon },
  { name: 'Microsoft Teams', icon: microsoftTeamsIcon },
];

export function Integrations(): JSX.Element {
  return (
    <section id="integrations" className="w-full" aria-labelledby="integrations-heading">
      <div className="container-ellie">
        <div className="mx-auto flex w-full max-w-[1034px] flex-col items-center gap-[32px] text-center">
          <div className="flex flex-col gap-4 md:gap-[20px]">
            <h2
              id="integrations-heading"
              className="font-poppins text-[32px] font-bold leading-[1.3] text-ellieBlack md:text-[55px] md:leading-[1.5]"
            >
              Integrations made <span className="text-ellieBlue">Easy!</span>
            </h2>
            <p className="font-nunito text-[16px] leading-[1.4] text-[#8792AF] md:text-[18px] md:leading-[1.364]">
              Ellie works with your existing meeting platforms such as Google Meet, Zoom, and Microsoft Teams to capture
              and remember context across every conversation.
            </p>
          </div>

          <div className="flex w-full flex-col items-center gap-[22px] md:flex-row md:justify-center md:gap-[22px]">
            {INTEGRATIONS.map((integration) => (
              <article
                key={integration.name}
                className="flex w-full max-w-[330px] flex-col items-center gap-[9px] rounded-[5px] bg-white px-[22px] py-[17px] shadow-[0_4px_10px_rgba(0,0,0,0.25)]"
              >
                <img
                  src={integration.icon}
                  alt={`${integration.name} logo`}
                  className="h-[130px] w-[230px] object-contain"
                />
                <span className="font-nunito text-[20px] font-bold text-ellieBlack md:text-[25px] md:leading-[1.36]">
                  {integration.name}
                </span>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


