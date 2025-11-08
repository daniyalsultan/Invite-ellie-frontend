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
    <section className="w-full bg-ellieBlue/5 py-[60px] lg:py-[80px]" aria-labelledby="hero-heading">
      <div className="container-ellie flex flex-col items-center gap-[32px] lg:grid lg:grid-cols-2 lg:items-center lg:gap-[46px]">
        <div className="order-2 flex flex-col gap-[28px] text-center lg:order-1 lg:gap-[61px] lg:text-left">
          <h1
            id="hero-heading"
            className="font-spaceGrotesk text-[36px] font-bold leading-[1.1] text-ellieBlack lg:text-hero lg:leading-[1.1743]"
          >
            <span className="block">{titleLead}</span>
            <span className="block">
              <span className="text-ellieBlue">{titleInvite}</span>{' '}
              <span className="text-[#7864A0]">{titleEllie}</span>
            </span>
          </h1>
          <p className="mx-auto max-w-[320px] font-nunito text-[18px] leading-[1.5] text-ellieGray lg:mx-0 lg:max-w-[618px] lg:text-[22px] lg:leading-[1.364]">
            {subtitle}
          </p>
          <div className="flex w-full max-w-[320px] flex-col items-stretch gap-4 lg:max-w-none lg:flex-row lg:items-center lg:justify-start">
            <a
              href="#cta"
              className="inline-flex w-full items-center justify-center rounded-[18px] bg-ellieBlue px-8 py-4 font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue lg:w-auto lg:rounded-[5px] lg:px-[40px] lg:py-[15px] lg:text-[20px]"
            >
              {ctaLabel}
            </a>
            <a
              href="#features"
              className="inline-flex w-full items-center justify-center rounded-[18px] border border-ellieNavy px-3 py-3 font-nunito text-[18px] font-semibold text-ellieNavy transition hover:bg-ellieBlue/10 lg:w-auto lg:rounded-[5px] lg:px-[30px] lg:py-[15px] lg:text-[18px]"
            >
              Features
            </a>
          </div>
        </div>

        <div className="order-1 w-full max-w-[360px] overflow-hidden rounded-[32px] bg-white shadow-[0_12px_30px_rgba(0,0,0,0.1)] lg:order-2 lg:max-w-none lg:rounded-[24px]">
          <img src={heroGraphic} alt="Ellie hero illustration" className="h-auto w-full" />
        </div>

        <div className="order-3 flex flex-col items-center gap-3 lg:-mt-6 lg:items-start lg:gap-[16px]">
          <span className="font-nunito text-[14px] font-semibold tracking-[0.24em] text-ellieNavy lg:text-[18px]">
            INTEGRATIONS
          </span>
          <img
            src={integrationsRow}
            alt="Integrations: Google Meet, Zoom, Microsoft Teams"
            className="max-w-[220px] lg:max-w-[420px]"
          />
        </div>
      </div>
    </section>
  );
}


