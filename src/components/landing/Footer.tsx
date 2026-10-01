import { Link } from 'react-router-dom';
import mark from '../../assets/ellie-mark.webp';

const footerLinks = [
  { to: '/#how', label: 'How it works' },
  { to: '/#features', label: 'What it does' },
  { to: '/#who', label: "Who it's for" },
  { to: '/#beta', label: 'Beta' },
  { to: '/privacy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms of Service' },
];

// Matches the marketing page's footer (see .foot in
// src/components/landing/site/site.css).
export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-ie-line bg-white font-dmSans">
      {/* Bottom padding leaves room for the app's floating chat button. */}
      <div className="ie-wrap flex flex-wrap items-center justify-between gap-5 pb-[120px] pt-9">
        <Link to="/" className="flex items-center gap-2.5 no-underline" aria-label="Invite Ellie home">
          <img src={mark} alt="" className="h-[34px] w-auto" aria-hidden="true" />
          <span className="whitespace-nowrap text-[1.3rem] font-bold leading-none tracking-[-0.025em]">
            <span className="text-ie-blue">Invite</span> <span className="text-ie-violet">Ellie</span>
          </span>
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-3">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className="text-[0.96rem] font-medium text-ie-muted no-underline transition-colors hover:text-ie-text"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="w-full text-[0.84rem] text-ie-muted">
          Stay present, we&apos;ve got the past. &copy; {new Date().getFullYear()} Invite Ellie
        </p>
      </div>
    </footer>
  );
}
