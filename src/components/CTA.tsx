import React from 'react';

export function CTA(): JSX.Element {
  return (
    <section id="cta" className="w-full py-14 md:py-20" aria-labelledby="cta-heading">
      <div className="container-ellie grid md:grid-cols-[1fr,380px] gap-6 items-center">
        <div className="flex flex-col gap-3">
          <h2 id="cta-heading" className="text-[24px] md:text-[32px] font-extrabold text-ellieBlack">Collaborate and share on your favorite tools</h2>
          <p className="text-ellieGray max-w-[720px]">Share meaningful meeting insights powered by AI to tools like Slack, Notion or HubSpot.</p>
        </div>
        <div className="flex md:justify-end">
          <a href="#" className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-6 py-3 text-white text-[16px] md:text-[18px] font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue transition">Get Started, it’s Free</a>
        </div>
      </div>
    </section>
  );
}


