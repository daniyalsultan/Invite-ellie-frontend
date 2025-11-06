// import React from 'react';
import icon1 from '../assets/feature-icon-1.svg';
import icon2 from '../assets/feature-icon-2.svg';
import icon3 from '../assets/feature-icon-3.svg';
import icon4 from '../assets/feature-icon-4.svg';
import icon5 from '../assets/feature-icon-5.svg';

export interface FeatureItem {
  title: string;
  description: string;
}

const FEATURES: (FeatureItem & { icon: string; alt: string })[] = [
  {
    title: 'Share & Export',
    description:
      'Easily share meeting notes, summaries, and action items with your team.',
    icon: icon1,
    alt: 'Share and export icon',
  },
  {
    title: 'Easy Integration',
    description:
      'Connect Ellie with Google Meet, Zoom, and Microsoft Teams. With more integrations coming soon',
    icon: icon2,
    alt: 'Integration icon',
  },
  {
    title: 'Full Context AI Notes',
    description:
      'Ellie understands, summarizes, and ties notes to past meetings for full context.',
    icon: icon3,
    alt: 'AI notes icon',
  },
  {
    title: 'Workspaces & Folders',
    description:
      'Organize your meetings by project or client. Ellie automatically links related conversations.',
    icon: icon4,
    alt: 'Folders icon',
  },
  {
    title: 'Memory',
    description:
      'Ellie remembers key details from your past meetings and surfaces context when needed.',
    icon: icon5,
    alt: 'Memory icon',
  },
];

export function Features(): JSX.Element {
  return (
    <section id="features" className="w-full py-12 md:py-16" aria-labelledby="features-heading">
      <div className="container-ellie">
        <h2 id="features-heading" className="text-[28px] md:text-[36px] font-extrabold text-ellieBlack mb-3">Features</h2>
        <p className="text-ellieGray max-w-[720px] mb-8">
          Visual context, real-time feedback and more! Ellie is more than a meeting assistant, she is your team’s memory and momentum.
        </p>
        <div className="grid md:grid-cols-2 xl:grid-cols-5 gap-6">
          {FEATURES.map((f) => (
            <article key={f.title} className="rounded-[20px] bg-[#F4F7FA] p-6 h-full flex flex-col gap-3">
              <img src={f.icon} alt={f.alt} className="h-10 w-10" />
              <h3 className="text-[20px] md:text-[22px] font-bold text-ellieBlack">{f.title}</h3>
              <p className="text-ellieBlack/80 text-[15px]">{f.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


