// import React from 'react';

export function Footer(): JSX.Element {
  return (
    <footer className="w-full border-t border-black/5 py-8 md:py-10 mt-8">
      <div className="container-ellie flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-ellieGray text-[14px]">© Invite Ellie</p>
        <nav aria-label="Footer">
          <ul className="flex items-center gap-6 text-[14px] text-ellieGray">
            <li><a className="hover:text-ellieBlack transition-colors" href="#features">Features</a></li>
            <li><a className="hover:text-ellieBlack transition-colors" href="#integrations">Integrations</a></li>
            <li><a className="hover:text-ellieBlack transition-colors" href="#cta">Get Started</a></li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}


