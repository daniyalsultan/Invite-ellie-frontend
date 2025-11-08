import logo from '../../assets/logo.svg';
import heroBackground from '../../assets/coming-soon-hero-bg.png';
import heroCollage from '../../assets/coming-soon-hero-collage.png';
import twitterIcon from '../../assets/coming-soon-twitter.png';
import mediumIcon from '../../assets/coming-soon-medium.png';
import discordIcon from '../../assets/coming-soon-discord.png';
import telegramIcon from '../../assets/coming-soon-telegram.png';
import linkedinIcon from '../../assets/coming-soon-linkedin.png';
import purpleSquare from '../../assets/coming-soon-purpleSquare.png';
import iconMemory from '../../assets/coming-soon-icon-memory.png';
import iconInsights from '../../assets/coming-soon-icon-insights.png';
import iconContext from '../../assets/coming-soon-icon-context.png';
import iconIntegrations from '../../assets/coming-soon-icon-integrations.png';
import iconUnderstands from '../../assets/coming-soon-icon-understands.png';

const WHAT_TO_EXPECT = [
  {
    title: 'Persistent memory',
    description: 'Ellie remembers every meeting, so you don’t have to.',
    icon: iconMemory,
  },
  {
    title: 'Real-time insights while you talk',
    description: 'Instant feedback if details drift or conflict.',
    icon: iconInsights,
  },
  {
    title: 'Context that carries over',
    description: 'Ellie remembers past decisions and surfaces them when needed.',
    icon: iconContext,
  },
  {
    title: 'Seamless integrations',
    description: 'Push outcomes to Slack, Notion, and your CRM.',
    icon: iconIntegrations,
  },
  {
    title: 'Understands what’s said & shown',
    description: 'Captures spoken words and AI assisted suggestions.',
    icon: iconUnderstands,
  },
];

export function ComingSoonPage(): JSX.Element {
  return (
    <div className="bg-white text-ellieNavy">
      <div className="w-full bg-[#2EA58F]">
        <div className="container-ellie flex justify-center py-[18px] lg:py-[22px]">
          <span className="font-spaceGrotesk text-[18px] font-bold uppercase tracking-[0.24em] text-white lg:text-[20px]">
            Coming Soon
          </span>
        </div>
      </div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#7964A0] text-white">
        <img
          src={heroBackground}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="container-ellie relative z-10 flex flex-col gap-12 py-[72px] lg:py-[96px]">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)] lg:items-center">
            <div className="flex flex-col gap-6 text-center lg:text-left">
              <div className="flex flex-col items-center gap-3 text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left">
                <img src={logo} alt="Invite Ellie logo" className="h-[72px] w-[72px]" />
                <div className="flex flex-col">
                  <span className="font-spaceGrotesk text-[40px] font-bold leading-[1.1]">
                    Invite Ellie
                  </span>
                  <span className="font-inter text-[18px] leading-[1.2] text-white/80">
                    For unforgettable meetings
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h1 className="text-[42px] font-extrabold leading-[1.1] md:text-[54px]">
                  Where alignment feels effortless
                </h1>
                <p className="font-nunito text-[18px] leading-[1.5] text-white/85 md:text-[20px]">
                  Ellie gives instant feedback in meetings when details drift, keeps context from
                  past meetings alive, and helps your team stay perfectly aligned.
                </p>
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                <img
                  src={heroCollage}
                  alt="Invite Ellie teammates collage"
                  className="h-auto w-full max-w-[460px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What to Expect */}
      <section className="bg-white py-[72px] lg:py-[96px]">
        <div className="container-ellie flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="font-nunito text-[42px] font-extrabold leading-[1.2] text-ellieBlack md:text-[48px]">
              What to Expect
            </h2>
          </div>

          <div className="grid w-full gap-6 md:grid-cols-2 xl:grid-cols-3">
            {WHAT_TO_EXPECT.map((item) => (
              <article
                key={item.title}
                className="flex h-full flex-col items-center gap-5 rounded-[18px] bg-white p-8 text-center shadow-[0_22px_60px_rgba(85,63,139,0.08)]"
              >
                <img src={item.icon} alt="" className="h-[140px] w-auto object-contain" />
                <h3 className="font-nunito text-[22px] font-bold leading-[1.3] text-ellieBlack">
                  {item.title}
                </h3>
                <p className="font-nunito text-[16px] leading-[1.5] text-[#545454]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Sign up for early access */}
      <section className="bg-white py-[72px] lg:py-[96px]">
        <div className="container-ellie flex flex-col items-center gap-8 text-center">
          <div className="flex max-w-[780px] flex-col items-center gap-4">
            <h2 className="font-nunito text-[38px] font-extrabold leading-[1.2] text-ellieBlack md:text-[46px]">
              Sign Up for Early Access &amp; Rewards
            </h2>
            <p className="font-nunito text-[18px] leading-[1.5] text-[#545454] md:text-[20px]">
              Ellie gives instant feedback in meetings when details drift, keeps context from past
              meetings alive, and helps your team stay perfectly aligned. We’re announcing a massive
              early discount at launch. Join the list to get first access.
            </p>
          </div>

          <form className="flex w-full max-w-[520px] flex-col gap-3">
            <input
              type="email"
              placeholder="Enter Email Address"
              className="w-full rounded-[14px] border border-[#C3B3DB] bg-white px-5 py-[15px] font-nunito text-[16px] text-ellieBlack placeholder-black/40 outline-none focus:border-[#7964A0] focus:ring-2 focus:ring-[#7964A0]/30"
            />
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center rounded-[14px] bg-[#7A64A3] px-[32px] py-[15px] font-nunito text-[16px] font-extrabold text-white transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7A64A3]"
            >
              Notify me
            </button>
          </form>

          <p className="max-w-[580px] font-nunito text-[13px] leading-[1.6] text-[#77708F] md:text-[14px]">
            By clicking subscribe you agree to receive product updates and launch information. You
            can unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#E6EFF5]">
        <div className="container-ellie flex flex-col gap-[36px] py-[40px] text-ellieBlack lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col items-center gap-[12px] text-center lg:items-start lg:text-left">
            <div className="flex items-center gap-[12px]">
              <img src={logo} alt="Invite Ellie logo" className="h-[48px] w-[48px]" />
              <div className="flex flex-col">
                <span className="font-spaceGrotesk text-[24px] font-bold leading-[1.2] text-ellieBlue">
                  Invite Ellie
                </span>
                <span className="font-inter text-[14px] text-[#596B7F]">
                  For unforgettable meetings
                </span>
              </div>
            </div>
            <p className="max-w-[420px] font-nunito text-[14px] leading-[1.6] text-[#46566B]">
              Ellie is your smart assistant that will help you remember what matters most from every meeting.
            </p>
          </div>
          <div className="flex flex-col items-center gap-[16px] text-center lg:items-end lg:text-left">
            <h3 className="font-nunito text-[16px] font-extrabold text-ellieBlack">Let&apos;s connect</h3>
            <div className="flex items-center gap-[12px]">
              {[
                { icon: telegramIcon, alt: 'Telegram' },
                { icon: twitterIcon, alt: 'Twitter' },
                { icon: mediumIcon, alt: 'Medium' },
                { icon: discordIcon, alt: 'Discord' },
                { icon: linkedinIcon, alt: 'LinkedIn' },
              ].map(({ icon, alt }) => (
                <span key={alt} className="relative inline-flex h-[44px] w-[44px] items-center justify-center">
                  <img src={purpleSquare} alt="" className="h-full w-full rounded-[12px]" />
                  <img src={icon} alt={alt} className="absolute h-[24px] w-[24px] object-contain" />
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#3C7AA3] py-[12px]">
          <div className="container-ellie flex items-center justify-center">
            <span className="font-nunito text-[13px] text-white">Copyrights 2025. Invite Ellie.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}