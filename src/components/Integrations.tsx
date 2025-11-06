import React from 'react';
import integrationsRow from '../assets/integrations-row.svg';

export function Integrations(): JSX.Element {
  return (
    <section id="integrations" className="w-full py-12 md:py-16" aria-labelledby="integrations-heading">
      <div className="container-ellie">
        <h2 id="integrations-heading" className="text-[14px] tracking-[0.2em] text-ellieGray mb-4">INTEGRATIONS</h2>
        <div className="rounded-[5px] bg-white shadow-sm border border-black/5 p-5 flex items-center justify-center">
          <img src={integrationsRow} alt="Integrations: Google Meet, Zoom, Microsoft Teams" className="max-w-full h-auto" />
        </div>
      </div>
    </section>
  );
}


