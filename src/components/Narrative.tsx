import React from 'react';
import narrativeImage from '../assets/narrative-image.svg';

export function Narrative(): JSX.Element {
  return (
    <section className="w-full py-12 md:py-16" aria-labelledby="narrative-heading">
      <div className="container-ellie grid md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h2 id="narrative-heading" className="text-[24px] md:text-[32px] font-extrabold text-ellieBlack">Ellie is Your Eyes, Ears, and Memory in Every Meeting</h2>
          <p className="text-ellieBlack/80 text-[16px] md:text-[18px]">
            Imagine joining your next meeting knowing nothing will be missed. As your team talks,
            Ellie listens, watches shared screens, and instantly connects what's said to what's
            shown. If a detail drifts off course, she provides real-time feedback to keep the
            discussion aligned. It's like having an employee in every meeting who forgets nothing,
            is always paying attention and gives real-time recommendations.
          </p>
          <div className="flex gap-3 items-center">
            <a href="#cta" className="inline-flex items-center justify-center rounded-[5px] bg-ellieBlue px-6 py-3 text-white text-[16px] md:text-[18px] font-bold hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ellieBlue transition">Get Started, it's Free</a>
            <a href="#features" className="rounded-[5px] border border-ellieBlue px-4 py-3 text-ellieBlue text-[16px] hover:bg-ellieBlue/5 transition">Features</a>
          </div>
        </div>
        <div className="min-h-[260px] md:min-h-[360px] rounded-md bg-white shadow-sm border border-black/5 flex items-center justify-center p-2">
          <img src={narrativeImage} alt="Ellie meeting assistant illustration" className="w-full h-auto" />
        </div>
      </div>
    </section>
  );
}


