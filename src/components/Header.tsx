// import React from 'react';
import logo from '../assets/logo.svg';

export interface HeaderProps {
  logoAlt?: string;
}

export function Header({ logoAlt = 'Invite Ellie' }: HeaderProps): JSX.Element {
  return (
    <header className="w-full bg-white">
      <div className="container-ellie flex items-center justify-between py-4 md:py-6">
        <a href="#" className="flex items-center gap-3" aria-label={logoAlt}>
          <img src={logo} alt="" className="h-16 w-20 md:h-20 md:w-24" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[24px] md:text-[32px] font-bold tracking-tight text-ellieBlack leading-tight">Invite Ellie</span>
            <span className="text-[12px] md:text-[14px] text-ellieGray leading-tight">For unforgettable meetings</span>
          </div>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8 text-[16px] text-ellieGray">
            <li><a className="hover:text-ellieBlack transition-colors" href="#features">Features</a></li>
            <li><a className="hover:text-ellieBlack transition-colors" href="#cta">Business</a></li>
            <li><a className="hover:text-ellieBlack transition-colors" href="#integrations-cards">Integrations</a></li>
          </ul>
        </nav>

        <a href="#cta" className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-5 py-2 text-white text-[16px] font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue transition">Get Started</a>
      </div>
    </header>
  );
}


