// import React from 'react';
import narrativeImage from '../../assets/narrative-image.svg';

export function Narrative(): JSX.Element {
  return (
    <section className="w-full bg-ellieBlue py-[64px] lg:py-[90px]" aria-labelledby="narrative-heading">
      <div className="container-ellie flex flex-col items-center gap-[36px] text-center text-white lg:grid lg:grid-cols-[minmax(0,543px)_minmax(0,1fr)] lg:items-center lg:gap-[92px] lg:pb-0 lg:text-left">
        <div className="order-1 flex w-full justify-center lg:order-2 lg:justify-end">
          <img
            src={narrativeImage}
            alt="Ellie meeting assistant illustration"
            className="w-full max-w-[360px] rounded-[32px] p-4  lg:max-w-none lg:rounded-none lg:bg-transparent lg:p-0 lg:shadow-none"
          />
        </div>

        <div className="order-2 flex w-full max-w-[560px] flex-col items-center gap-[28px] lg:order-1 lg:max-w-none lg:items-start">
          <div className="flex flex-col gap-[18px]">
            <h2
              id="narrative-heading"
              className="font-nunito text-[32px] font-extrabold leading-[1.25] lg:text-[50px] lg:leading-[1.1]"
            >
              Ellie is Your Eyes, Ears, and Memory in Every Meeting
            </h2>
            <p className="font-nunito text-[18px] leading-[1.5] text-white/90 lg:text-[20px] lg:leading-[1.5]">
              Imagine joining your next meeting knowing nothing will be missed. As your team talks,
              Ellie listens, watches shared screens, and instantly connects what&apos;s said to what&apos;s
              shown. If a detail drifts off course, she provides real-time feedback to keep the
              discussion aligned. It&apos;s like having an employee in every meeting who forgets nothing,
              is always paying attention and gives real-time recommendations.
            </p>
          </div>

          <div className="flex w-full max-w-[320px] flex-col items-center gap-3 lg:max-w-none lg:flex-row lg:items-center">
            <a
              href="#cta"
              className="inline-flex w-full items-center justify-center rounded-[18px] bg-white px-[32px] py-[14px] font-nunito text-[18px] font-extrabold text-ellieBlue transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white lg:w-auto lg:px-[50px] lg:py-[15px] lg:text-[20px] lg:rounded-[5px]"
            >
              Get Started, it&apos;s Free
            </a>
            <a
              href="#features"
              className="font-nunito text-[18px] font-semibold text-white transition hover:opacity-80 lg:text-[18px]"
            >
              Features
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


