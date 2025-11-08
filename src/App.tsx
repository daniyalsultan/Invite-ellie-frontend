// import React from 'react';
import { Header } from './components/landing/Header';
import { Hero } from './components/landing/Hero';
import { Integrations } from './components/landing/Integrations';
import { Features } from './components/landing/Features';
import { Trusted } from './components/landing/Trusted';
import { Narrative } from './components/landing/Narrative';
import { CTA } from './components/landing/CTA';
import { Footer } from './components/landing/Footer';
import { FAQ } from './components/landing/FAQ';

function App(): JSX.Element {
  return (
    <div className="min-h-full">
      <Header />
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
    </div>
  );
}

export default App;


