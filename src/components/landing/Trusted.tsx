import slackCard from '../../assets/trusted-slack.svg';
import notionCard from '../../assets/trusted-notion.svg';
import hubspotCard from '../../assets/trusted-hubshot.svg';

export function Trusted(): JSX.Element {
  return (
    <section className="w-full py-[60px] lg:py-[80px]" aria-labelledby="trusted-heading">
      <div className="container-ellie flex flex-col items-center gap-[28px] text-center lg:gap-[41px]">
        <h2
          id="trusted-heading"
          className="font-nunito text-[22px] font-extrabold uppercase leading-[1.3] text-ellieBlack lg:text-[25px] lg:leading-[1.364]"
        >
          COLLABORATE AND SHARE ON YOUR FAVORITE TOOLS
        </h2>
        <div className="grid w-full max-w-[640px] grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 lg:max-w-none lg:grid-cols-3">
          <img
            src={slackCard}
            alt="Slack integration"
            className="w-full max-w-[240px] rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
          />
          <img
            src={notionCard}
            alt="Notion integration"
            className="w-full max-w-[240px] rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
          />
          <img
            src={hubspotCard}
            alt="HubSpot integration"
            className="w-full max-w-[240px] rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.08)]"
          />
        </div>
        <p className="max-w-[520px] font-nunito text-[15px] leading-[1.5] text-[#7682A1] lg:max-w-[720px] lg:text-[18px] lg:leading-[1.364]">
          Share meaningful meeting insights powered by AI to most common tools like Slack, Notion or HubSpot so you stay
          ahead post meeting every time.
        </p>
      </div>
    </section>
  );
}


