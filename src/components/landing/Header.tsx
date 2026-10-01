import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import mark from '../../assets/ellie-mark.webp';

export interface HeaderProps {
  logoAlt?: string;
}

const navLinks = [
  { to: '/#how', label: 'How it works' },
  { to: '/#features', label: 'What it does' },
  { to: '/#who', label: "Who it's for" },
  { to: '/#beta', label: 'Beta' },
];

// Matches the marketing page's navigation bar (see .nav in
// src/components/landing/site/site.css) so moving between the landing page
// and the auth pages feels like one site.
export function Header({ logoAlt = 'Invite Ellie' }: HeaderProps): JSX.Element {
  const { pathname } = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-white/90 font-dmSans backdrop-blur-[14px] backdrop-saturate-[1.3] transition-colors ${
        scrolled ? 'border-ie-line' : 'border-transparent'
      }`}
    >
      <div className="ie-wrap flex h-[72px] items-center justify-between gap-3 md:gap-5">
        <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label={logoAlt}>
          <img src={mark} alt="" className="h-[28px] w-auto md:h-[34px]" aria-hidden="true" />
          <span className="hidden whitespace-nowrap text-[1.15rem] font-bold leading-none tracking-[-0.025em] min-[481px]:inline md:text-[1.3rem]">
            <span className="text-ie-blue">Invite</span> <span className="text-ie-violet">Ellie</span>
          </span>
        </Link>

        <div className="flex items-center gap-3.5 md:gap-[30px]">
          <nav aria-label="Main" className="hidden gap-7 min-[901px]:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-[0.96rem] font-medium text-ie-muted no-underline transition-colors hover:text-ie-text"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {pathname !== '/login' && (
            <Link
              to="/login"
              className="whitespace-nowrap text-[0.86rem] font-medium text-ie-muted no-underline transition-colors hover:text-ie-text md:text-[0.96rem]"
            >
              Sign in
            </Link>
          )}
          {pathname !== '/signup' && (
            <Link to="/signup" className="ie-btn-primary ie-btn-sm max-[420px]:px-3 max-[420px]:text-[0.86rem]">
              Start your free beta
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
