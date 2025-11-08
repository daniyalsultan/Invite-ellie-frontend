// import React from 'react';
import narrativeImage from '../../assets/narrative-image.svg';

export function Narrative(): JSX.Element {
  return (
    <section className="w-full bg-ellieBlue" aria-labelledby="narrative-heading">
      <div className="container-ellie grid items-center gap-[40px] text-white md:grid-cols-[minmax(0,543px)_minmax(0,1fr)] md:gap-[92px] md:pb-0">
        <div className="flex flex-col gap-[32px]">
          <div className="flex flex-col gap-[16px]">
            <h2
              id="narrative-heading"
              className="font-nunito text-[30px] font-extrabold leading-[1.1743] md:text-[50px]"
            >
              Ellie is Your Eyes, Ears, and Memory in Every Meeting
            </h2>
            <p className="font-nunito text-[18px] leading-[1.364] text-white/90 md:text-[20px]">
              Imagine joining your next meeting knowing nothing will be missed. As your team talks,
              Ellie listens, watches shared screens, and instantly connects what's said to what's
              shown. If a detail drifts off course, she provides real-time feedback to keep the
              discussion aligned. It's like having an employee in every meeting who forgets nothing,
              is always paying attention and gives real-time recommendations.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[6px]">
            <a
              href="#cta"
              className="inline-flex items-center justify-center rounded-[5px] bg-white px-[50px] py-[15px] font-nunito text-[18px] font-extrabold text-ellieBlue transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:text-[20px]"
            >
              Get Started, it's Free
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-[5px] border border-white px-[40px] py-[15px] font-nunito text-[18px] font-semibold text-white transition hover:bg-white/10"
            >
              Features
            </a>
          </div>
        </div>
        <div className="flex min-h-[260px] items-end justify-center md:min-h-[400px]">
          <img src={narrativeImage} alt="Ellie meeting assistant illustration" className="block h-auto w-full" />
        </div>
      </div>
    </section>
  );
}


