// import React from 'react';
import trustedLogos from '../../assets/trusted-logos.svg';

export function Trusted(): JSX.Element {
  return (
    <section className="w-full" aria-labelledby="trusted-heading">
      <div className="container-ellie flex flex-col items-center gap-[32px] text-center md:gap-[41px]">
        <h2
          id="trusted-heading"
          className="font-nunito text-[22px] font-extrabold uppercase leading-[1.3] text-ellieBlack md:text-[25px] md:leading-[1.364]"
        >
          COLLABORATE AND SHARE ON YOUR FAVORITE TOOLS
        </h2>
        <img src={trustedLogos} alt="Trusted partner logos" className="h-auto max-w-[846px]" />
        <p className="max-w-[720px] font-nunito text-[16px] leading-[1.364] text-[#7682A1] md:text-[18px]">
          Share meaningful meeting insights powered by AI to most common tools like Slack, Notion or HubSpot.
        </p>
      </div>
    </section>
  );
}


