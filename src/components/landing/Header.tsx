import { useEffect, useState } from 'react';
import logo from '../../assets/logo.svg';

export interface HeaderProps {
  logoAlt?: string;
}

export function Header({ logoAlt = 'Invite Ellie' }: HeaderProps): JSX.Element {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const closeMenu = (): void => setIsMenuOpen(false);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#cta', label: 'Business' },
    { href: '#integrations', label: 'Integrations' },
  ];

  return (
    <header className="w-full">
      {/* Announcement Banner */}
      <div className="w-full bg-ellieBlue">
        <div className="container-ellie flex flex-wrap items-center justify-center gap-[9px] py-[12px]">
          <p className="text-white font-nunito text-[16px] lg:text-[22px] font-semibold leading-[1.364] text-center">
            Ellie remembers your discussions, decisions, and next steps. So your team never starts from scratch.
          </p>
          <span className="inline-flex items-center rounded-[2.5px] bg-ellieAccent px-[12px] py-[6px] font-nunito text-white text-[12px] lg:text-[15px] font-extrabold uppercase leading-[0.8] tracking-[0.08em]">
            NEW
          </span>
        </div>
      </div>

      {/* Navigation Bar */}
      <div className="container-ellie flex items-center gap-4 py-[18px] lg:py-[32px]">
        <button
          type="button"
          className="flex h-10 w-10 flex-shrink-0 flex-col items-center justify-center gap-[6px] rounded-md bg-white text-ellieBlue lg:hidden"
          aria-label="Open navigation"
          onClick={() => setIsMenuOpen(true)}
        >
          <span aria-hidden className="block h-[2px] w-5 rounded-full bg-current"></span>
          <span aria-hidden className="block h-[2px] w-5 rounded-full bg-current"></span>
          <span aria-hidden className="block h-[2px] w-5 rounded-full bg-current"></span>
        </button>

        <a href="#" className="mx-auto flex items-center gap-2 lg:mx-0 lg:gap-[20px]" aria-label={logoAlt}>
          <img src={logo} alt="" className="h-[56px] w-[56px]" aria-hidden="true" />
          <div className="hidden flex-col lg:flex">
            <span className="font-spaceGrotesk text-[28px] lg:text-[39px] font-bold tracking-tight text-ellieBlack leading-[1.1743]">
              Invite Ellie
            </span>
            <span className="font-inter text-[12px] lg:text-[15px] text-ellieGray leading-[1.1743]">
              For unforgettable meetings
            </span>
          </div>
        </a>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-[67px] font-nunito text-[18px] text-ellieNavy lg:flex lg:text-[20px] lg:font-semibold">
          {navLinks.map((link) => (
            <a key={link.label} className="transition-colors hover:text-ellieBlack" href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-shrink-0 items-center gap-[10px]">
          <a
            className="hidden lg:inline-flex items-center justify-center rounded-[5px] border border-transparent px-[30px] py-[10px] font-nunito text-[18px] font-medium text-ellieNavy transition-colors hover:text-ellieBlack"
            href="#login"
          >
            Login
          </a>
          <a
            href="#cta"
            className="inline-flex items-center justify-center rounded-[12px] bg-ellieBlue px-6 py-[10px] font-nunito text-[16px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue lg:rounded-[5px] lg:px-[50px] lg:py-[15px] lg:text-[20px]"
          >
            <span className="lg:hidden">Sign Up</span>
            <span className="hidden lg:inline">Sign Up for free</span>
          </a>
        </div>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#F4F2F8] px-8 py-10 lg:hidden animate-drawer-in-left">
          <div className="flex flex-col h-full justify-between">
            <div className="flex flex-col gap-8">
              <button
                type="button"
                className="ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-ellieNavy/20 text-ellieNavy"
                aria-label="Close navigation"
                onClick={closeMenu}
              >
                <span aria-hidden className="text-2xl leading-none">&times;</span>
              </button>

              <a
                href="#cta"
                className="w-full rounded-[18px] bg-ellieBlue py-4 text-center font-nunito text-[18px] font-extrabold text-white"
                onClick={closeMenu}
              >
                Sign Up for free
              </a>

              <a
                href="#login"
                className="text-center font-nunito text-[18px] font-semibold text-ellieNavy"
                onClick={closeMenu}
              >
                Login
              </a>

              <nav className="flex flex-col gap-8 text-left">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-nunito text-[22px] font-semibold text-ellieBlack"
                    onClick={closeMenu}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            <div className="flex flex-col items-center gap-3">
              <img src={logo} alt="Invite Ellie" className="h-[72px] w-[72px]" />
              <div className="text-center">
                <p className="font-spaceGrotesk text-[22px] font-bold leading-[1.1743] text-ellieBlue">
                  Invite <span className="text-[#7864A0]">Ellie</span>
                </p>
                <p className="font-inter text-[14px] text-ellieGray">For unforgettable meetings</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}


