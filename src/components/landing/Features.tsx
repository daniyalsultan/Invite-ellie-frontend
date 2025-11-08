// import React from 'react';
import shareExportIcon from '../../assets/feature-icon-share-export.svg';
import easyIntegrationIcon from '../../assets/feature-icon-easy-integration.svg';
import aiNotesIcon from '../../assets/feature-icon-ai-notes.svg';
import memoryIcon from '../../assets/feature-icon-memory.svg';
import workspacesIcon from '../../assets/feature-icon-workspaces.svg';
import transcriptionsIcon from '../../assets/feature-icon-transcriptions.svg';

export interface FeatureItem {
  title: string;
  description: string;
}

const FEATURES: (FeatureItem & { icon: string; alt: string })[] = [
  {
    title: 'Workspaces & Folders',
    description:
      'Organize your meetings by project or client. Ellie automatically links related conversations, helping you recall past discussions in seconds.',
    icon: workspacesIcon,
    alt: 'Folders icon',
  },
  {
    title: 'Easy Integration',
    description:
      'Connect Ellie with Google Meet, Zoom, and Microsoft Teams. With more integrations coming soon',
    icon: easyIntegrationIcon,
    alt: 'Integration icon',
  },
  {
    title: 'Memory',
    description:
      'Ellie remembers key details from your past meetings, connects related conversations, and surfaces important context when you need it. So nothing slips through the cracks.',
    icon: memoryIcon,
    alt: 'Memory icon',
  },
  {
    title: 'Full Context AI Notes',
    description:
      "Ellie doesn't just transcribe, it understands. Get structured summaries, decisions, and to-dos, all tied to your past meetings for full context.",
    icon: aiNotesIcon,
    alt: 'AI notes icon',
  },
  {
    title: 'Real time Transcriptions',
    description:
      'Every word captured, every insight saved. Ellie keeps your transcripts accurate and instantly searchable.',
    icon: transcriptionsIcon,
    alt: 'Transcriptions icon',
  },
  {
    title: 'Share & Export',
    description:
      'Easily share meeting notes, summaries, and action items with your team.',
    icon: shareExportIcon,
    alt: 'Share and export icon',
  },
];

export function Features(): JSX.Element {
  return (
    <section id="features" className="w-full" aria-labelledby="features-heading">
      <div className="container-ellie flex flex-col items-center gap-[32px] text-center">
        <div className="flex flex-col items-center gap-4">
          <h2
            id="features-heading"
            className="font-nunito text-[32px] font-extrabold leading-[1.3] text-ellieBlack lg:text-[55px] lg:leading-[1.364]"
          >
            Features
          </h2>
          <p className="max-w-[780px] font-nunito text-[16px] leading-[1.4] text-[#8792AF] lg:text-[18px] lg:leading-[1.364]">
            Visual context, real-time feedback and more! Ellie is more than a meeting assistant, she is your team's memory and momentum.
          </p>
        </div>

        <div className="grid w-full gap-[22px] lg:grid-cols-2">
          {FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="flex h-full items-center gap-[16px] rounded-[20px] bg-[rgba(121,100,160,0.05)] p-[24px] lg:gap-[24px] lg:px-[40px] lg:py-[20px]"
            >
              <div className="flex flex-shrink-0 items-center justify-center">
                <img
                  src={feature.icon}
                  alt={feature.alt}
                  className="h-[64px] w-[64px] object-contain sm:h-[80px] sm:w-[80px] lg:h-[106px] lg:w-[106px]"
                />
              </div>
              <div className="flex flex-1 flex-col gap-[5px] text-left">
                <h3 className="font-nunito text-[20px] font-bold leading-[1.364] text-ellieBlack lg:text-[25px]">
                  {feature.title}
                </h3>
                <p className="font-nunito text-[16px] font-medium leading-[1.364] text-ellieBlack/80 lg:text-[18px]">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


