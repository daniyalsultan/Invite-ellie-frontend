import { CTA } from './CTA';
import { FAQ } from './FAQ';
import { Features } from './Features';
import { Hero } from './Hero';
import { Integrations } from './Integrations';
import { Narrative } from './Narrative';
import { Trusted } from './Trusted';
import { Footer } from './Footer';

export function LandingPage(): JSX.Element {
  return (
    <>
      <main className="flex flex-col gap-[80px] lg:gap-[118px]">
        <Hero />
        <Integrations />
        <Trusted />
        <Features />
        <Narrative />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

