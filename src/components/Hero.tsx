// import React from 'react';
import heroGraphic from '../assets/hero-graphic.svg';

export interface HeroProps {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
}

export function Hero({
  title = 'For every meeting, Invite Ellie',
  subtitle = "Ellie gives instant feedback in meetings when details drift, keeps context from past meetings alive, and helps your team stay perfectly aligned.",
  ctaLabel = 'Get Started, it’s Free',
}: HeroProps): JSX.Element {
  return (
    <section className="w-full bg-ellieBlue/5" aria-labelledby="hero-heading">
      <div className="container-ellie grid md:grid-cols-2 gap-6 md:gap-12 py-10 md:py-16">
        <div className="flex flex-col gap-4 md:gap-6">
          <h1 id="hero-heading" className="text-2xl md:text-hero font-extrabold leading-tight text-ellieBlack">{title}</h1>
          <p className="text-[16px] md:text-[22px] text-ellieGray max-w-[618px]">{subtitle}</p>
          <div className="flex gap-2 md:gap-3 items-center">
            <a href="#cta" className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-6 py-3 text-white text-[16px] md:text-[18px] font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue transition">{ctaLabel}</a>
            <a href="#features" className="rounded-[5px] border border-ellieBlue px-4 py-3 text-ellieBlue text-[16px] hover:bg-ellieBlue/5 transition">Features</a>
          </div>
        </div>

        <div className="min-h-[260px] md:min-h-[400px] rounded-md bg-white shadow-sm border border-black/5 flex items-center justify-center p-2">
          <img src={heroGraphic} alt="Ellie hero illustration" className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}


