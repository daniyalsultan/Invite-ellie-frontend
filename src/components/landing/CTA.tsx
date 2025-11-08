import logo from '../../assets/logo.svg';
import socials from '../../assets/cta-socials.svg';

export function CTA(): JSX.Element {
  return (
    <section
      id="cta"
      className="w-full bg-[#F4F2F8] py-[75px] md:py-[90px]"
      aria-labelledby="cta-heading"
    >
      <div className="container-ellie flex justify-center">
        <div className="flex w-full max-w-[1354px] flex-col gap-[43px] md:flex-row md:items-start md:gap-[80px]">
          <div className="flex flex-1 flex-col gap-[24px] md:max-w-none md:text-left">
            <div className="flex items-center gap-[20px]">
              <img src={logo} alt="Invite Ellie logo mark" className="h-[72px] w-[72px]" />
              <div className="flex flex-col">
                <span className="font-spaceGrotesk text-[32px] font-bold leading-[1.1743] text-ellieBlue md:text-[40px]">
                  Invite <span className="text-[#7864A0]">Ellie</span>
                </span>
                <span className="font-inter text-[16px] text-[#545454] leading-[1.2] md:text-[18px]">
                  For unforgettable meetings
                </span>
              </div>
            </div>
            <p className="font-nunito text-[18px] leading-[1.364] text-ellieBlack/80 md:text-[20px]">
              Ellie keeps the memory of your meetings alive. From key takeaways to future action items. Turn
              every conversation into perfect team alignment.
            </p>
          </div>

          <div className="flex flex-1 flex-col gap-[63px] md:max-w-none md:text-left">
            <div className="flex flex-col gap-[16px]">
              <h2
                id="cta-heading"
                className="font-nunito text-[24px] font-extrabold leading-[1.364] text-ellieBlack md:text-[30px]"
              >
                Stay in sync with Ellie
              </h2>
              <p className="font-nunito text-[16px] leading-[1.364] text-ellieGray md:text-[18px]">
                Get updates on new AI memory features, smarter integrations, and tips to help your team work more
                efficiently.
              </p>
              <form className="flex flex-col gap-4 md:flex-row md:items-center md:gap-4">
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  placeholder="Enter Email"
                  className="w-full rounded-[5px] border border-[#7964A0] bg-white px-[24px] py-[15px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30 md:text-[20px]"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-[40px] py-[15px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue md:text-[20px]"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="flex flex-col gap-[16px]">
              <h3 className="font-nunito text-[24px] font-extrabold leading-[1.364] text-ellieBlack md:text-[30px]">
                Let's connect
              </h3>
              <img src={socials} alt="Ellie social channels" className="h-auto w-[220px] md:w-[307px]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


