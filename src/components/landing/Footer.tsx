export function Footer(): JSX.Element {
  return (
    <footer className="w-full bg-ellieBlue py-[24px] lg:py-[30px]">
      <div className="container-ellie flex flex-col items-center gap-3 lg:flex-row lg:justify-center lg:gap-4">
        <p className="flex items-center gap-2 font-nunito text-[14px] text-white lg:text-[16px]">
          <span aria-hidden="true">©</span>
          <span>Copyrights 2025. Invite Ellie.</span>
        </p>
      </div>
    </footer>
  );
}


