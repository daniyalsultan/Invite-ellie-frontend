import { Link } from 'react-router-dom';

export function Footer(): JSX.Element {
  return (
    <footer className="w-full bg-ellieBlue py-[24px] lg:py-[30px]">
      <div className="container-ellie flex flex-col items-center gap-3 lg:flex-row lg:justify-center lg:gap-4">
        <p className="flex items-center gap-2 font-nunito text-[14px] text-white lg:text-[16px]">
          <span aria-hidden="true">©</span>
          <span>Copyrights 2025. Invite Ellie.</span>
        </p>
        <div className="flex items-center gap-4">
          <Link
            to="/privacy"
            className="font-nunito text-[14px] text-white lg:text-[16px] hover:underline transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="font-nunito text-[14px] text-white lg:text-[16px] hover:underline transition-colors"
          >
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}


