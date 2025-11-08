// import React from 'react';
import heroGraphic from '../../assets/hero-graphic.svg';
import integrationsRow from '../../assets/integrations-row.svg';

export interface HeroProps {
  titleLead?: string;
  titleInvite?: string;
  titleEllie?: string;
  subtitle?: string;
  ctaLabel?: string;
}

export function Hero({
  titleLead = 'For every meeting,',
  titleInvite = 'Invite',
  titleEllie = 'Ellie',
  subtitle = "Ellie gives instant feedback in meetings when details drift, keeps context from past meetings alive, and helps your team stay perfectly aligned.",
  ctaLabel = "Get Started, it's Free",
}: HeroProps): JSX.Element {
  return (
    <section className="w-full bg-ellieBlue/5 py-[60px] md:py-[80px]" aria-labelledby="hero-heading">
      <div className="container-ellie grid items-center gap-[32px] md:grid-cols-2 md:gap-[46px]">
        <div className="flex flex-col gap-[40px] md:gap-[61px]">
          <div className="flex flex-col gap-4 md:gap-[16px]">
            <h1
              id="hero-heading"
              className="text-[32px] md:text-hero font-extrabold leading-[1.1743] text-ellieBlack"
            >
              <span className="block">{titleLead}</span>
              <span className="block">
                <span className="text-ellieBlue">{titleInvite}</span>{' '}
                <span className="text-[#7864A0]">{titleEllie}</span>
              </span>
            </h1>
            <p className="font-nunito text-[18px] md:text-[22px] font-medium leading-[1.364] text-ellieGray max-w-[618px]">
              {subtitle}
            </p>
            <div className="flex flex-wrap items-center gap-[6px]">
              <a
                href="#cta"
                className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-[40px] py-[15px] font-nunito text-[18px] md:text-[20px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue"
              >
                {ctaLabel}
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-[5px] border border-ellieNavy px-[30px] py-[15px] font-nunito text-[18px] font-semibold text-ellieNavy transition hover:bg-ellieBlue/10"
              >
                Features
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center gap-[20px] md:items-start md:gap-[27px]">
            <span className="font-nunito text-[14px] md:text-[18px] font-semibold tracking-[0.24em] text-ellieNavy">
              INTEGRATIONS
            </span>
            <img
              src={integrationsRow}
              alt="Integrations: Google Meet, Zoom, Microsoft Teams"
              className="max-w-[320px] md:max-w-[420px]"
            />
          </div>
        </div>

        <div className="flex min-h-[260px] items-center justify-center md:min-h-[400px]">
          <img src={heroGraphic} alt="Ellie hero illustration" className="h-auto w-full rounded-[12px]" />
        </div>
      </div>
    </section>
  );
}


