// import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Integrations } from './components/Integrations';
import { Features } from './components/Features';
import { IntegrationsCards } from './components/IntegrationsCards';
import { Trusted } from './components/Trusted';
import { Narrative } from './components/Narrative';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { FAQ } from './components/FAQ';

function App(): JSX.Element {
  return (
    <div className="min-h-full">
      <Header />
      <main>
        <Hero />
        <Integrations />
        <IntegrationsCards />
        <Narrative />
        <Trusted />
        <Features />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;


