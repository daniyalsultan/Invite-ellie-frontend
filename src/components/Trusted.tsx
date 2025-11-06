// import React from 'react';
import trustedLogos from '../assets/trusted-logos.svg';

export function Trusted(): JSX.Element {
  return (
    <section className="w-full py-10 md:py-14" aria-labelledby="trusted-heading">
      <div className="container-ellie flex flex-col gap-4">
        <h2 id="trusted-heading" className="text-[12px] tracking-[0.2em] text-ellieGray">TRUSTED & CERTIFIED</h2>
        <h3 className="text-[18px] md:text-[22px] font-extrabold text-ellieBlack">COLLABORATE AND SHARE ON YOUR FAVORITE TOOLS</h3>
        <img src={trustedLogos} alt="Trusted partner logos" className="max-w-full h-auto" />
        <p className="text-ellieGray max-w-[720px]">Share meaningful meeting insights powered by AI to most common tools like Slack, Notion or HubSpot.</p>
      </div>
    </section>
  );
}


