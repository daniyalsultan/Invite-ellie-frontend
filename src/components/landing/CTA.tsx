import logo from '../../assets/logo.svg';
import twitterIcon from '../../assets/cta-twitter.svg';
import youtubeIcon from '../../assets/cta-youtube.svg';
import instagramIcon from '../../assets/cta-insta.svg';
import tiktokIcon from '../../assets/cta-tiktok.svg';

export function CTA(): JSX.Element {
  return (
    <section
      id="cta"
      className="w-full bg-[#F4F2F8] py-[60px] text-black lg:bg-[#F4F2F8] lg:py-[90px]"
      aria-labelledby="cta-heading"
    >
      <div className="container-ellie flex justify-center">
        <div className="flex w-full max-w-[388px] flex-col items-center gap-[36px] text-center lg:max-w-[1354px] lg:flex-row lg:items-start lg:gap-[80px] lg:text-left">
          <div className="flex flex-1 flex-col items-center gap-[20px] lg:items-start">
            <div className="flex items-center gap-[16px]">
              <img src={logo} alt="Invite Ellie logo mark" className="h-[72px] w-[72px]" />
              <div className="flex flex-col items-start gap-[4px]">
                <span className="font-spaceGrotesk text-[32px] font-bold leading-[1.1743] text-ellieBlue lg:text-[40px]">
                  Invite <span className="text-[#7864A0]">Ellie</span>
                </span>
                <span className="font-inter text-[16px] leading-[1.2] text-[#3F3F3F] lg:text-[18px]">
                  For unforgettable meetings
                </span>
              </div>
            </div>
            <p className="font-nunito text-[18px] leading-[1.5] text-[#111111] lg:w-full lg:text-[20px] lg:leading-[1.364] lg:text-ellieBlack/80">
              Ellie keeps the memory of your meetings alive. From key takeaways to future action items. Turn
              every conversation into perfect team alignment.
            </p>
          </div>

          <div className="flex w-full flex-1 flex-col items-center gap-[40px] lg:max-w-none lg:items-start">
            <div className="flex w-full flex-col items-center gap-[16px] lg:items-start">
              <h2
                id="cta-heading"
                className="font-nunito text-[22px] font-extrabold leading-[1.364] text-[#111111] lg:text-[30px] lg:text-ellieBlack"
              >
                Stay in sync with Ellie
              </h2>
              <p className="font-nunito text-[16px] leading-[1.5] text-[#111111] lg:text-[18px] lg:leading-[1.364] lg:text-ellieGray">
                Get updates on new AI memory features, smarter integrations, and tips to help your team work more
                efficiently.
              </p>
              <form className="flex w-full max-w-[320px] flex-col gap-4 lg:max-w-none lg:flex-row lg:items-center lg:gap-4">
                <label htmlFor="cta-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="cta-email"
                  type="email"
                  placeholder="Enter Email"
                  className="w-full rounded-[12px] border border-white/50 bg-white px-[24px] py-[15px] font-nunito text-[18px] text-ellieBlack placeholder-black/30 outline-none focus:border-ellieBlue focus:ring-2 focus:ring-ellieBlue/30 lg:rounded-[5px] lg:border-[#7964A0] lg:text-[20px]"
                />
                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-[12px] bg-ellieBlue px-[40px] py-[15px] font-nunito text-[18px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue lg:w-auto lg:rounded-[5px] lg:text-[20px]"
                >
                  Subscribe
                </button>
              </form>
            </div>

            <div className="flex flex-col items-center gap-[16px] lg:items-start">
              <h3 className="font-nunito text-[22px] font-extrabold leading-[1.364] text-[#111111] lg:text-[30px] lg:text-ellieBlack">
                Let's connect
              </h3>
              <div className="flex items-center gap-[14px]">
                <img src={twitterIcon} alt="Follow Ellie on Twitter" className="h-[50px] w-[50px]" />
                <img src={youtubeIcon} alt="Subscribe to Ellie on YouTube" className="h-[50px] w-[50px]" />
                <img src={instagramIcon} alt="Follow Ellie on Instagram" className="h-[50px] w-[50px]" />
                <img src={tiktokIcon} alt="Follow Ellie on TikTok" className="h-[50px] w-[50px]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


