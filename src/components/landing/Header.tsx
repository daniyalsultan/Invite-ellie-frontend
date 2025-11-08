// import React from 'react';
import logo from '../../assets/logo.svg';

export interface HeaderProps {
  logoAlt?: string;
}

export function Header({ logoAlt = 'Invite Ellie' }: HeaderProps): JSX.Element {
  return (
    <header className="w-full">
      {/* Announcement Banner */}
      <div className="w-full bg-ellieBlue">
        <div className="container-ellie flex flex-wrap items-center justify-center gap-[9px] py-[12px]">
          <p className="text-white font-nunito text-[18px] md:text-[22px] font-semibold leading-[1.364] text-center">
            Ellie remembers your discussions, decisions, and next steps. So your team never starts from scratch.
          </p>
          <span className="inline-flex items-center rounded-[2.5px] bg-ellieAccent px-[12px] py-[6px] font-nunito text-white text-[12px] md:text-[15px] font-extrabold uppercase leading-[0.8] tracking-[0.08em]">
            NEW
          </span>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="container-ellie flex items-center justify-between py-[32px]">
        <a href="#" className="flex items-center gap-[20px]" aria-label={logoAlt}>
          <img src={logo} alt="" className="h-[58px] w-[58px]" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="font-spaceGrotesk text-[28px] md:text-[39px] font-bold tracking-tight text-ellieBlack leading-[1.1743]">
              Invite Ellie
            </span>
            <span className="font-inter text-[12px] md:text-[15px] text-ellieGray leading-[1.1743]">
              For unforgettable meetings
            </span>
          </div>
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-[67px] font-nunito text-[18px] text-ellieNavy md:text-[20px] font-semibold">
            <li>
              <a className="transition-colors hover:text-ellieBlack" href="#features">
                Features
              </a>
            </li>
            <li>
              <a className="transition-colors hover:text-ellieBlack" href="#cta">
                Business
              </a>
            </li>
            <li>
              <a className="transition-colors hover:text-ellieBlack" href="#integrations">
                Integrations
              </a>
            </li>
          </ul>
        </nav>

        <div className="flex items-center gap-[10px]">
          <a
            className="hidden md:inline-flex items-center justify-center rounded-[5px] border border-transparent px-[30px] py-[10px] font-nunito text-[18px] font-medium text-ellieNavy transition-colors hover:text-ellieBlack"
            href="#login"
          >
            Login
          </a>
          <a
            href="#cta"
            className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-[50px] py-[15px] font-nunito text-[18px] md:text-[20px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue"
          >
            Sign Up for free
          </a>
        </div>
      </div>
    </header>
  );
}


