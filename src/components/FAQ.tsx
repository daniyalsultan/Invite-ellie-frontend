import React, { useState } from 'react';

type FaqItem = {
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How does Ellie remember past meetings?',
    answer:
      'Ellie securely stores and organizes your meeting data, linking notes, tasks, and topics across sessions so she can recall details whenever you need them.',
  },
  {
    question: 'Can Ellie recognize recurring topics or projects?',
    answer:
      'Yes! Ellie identifies recurring themes, team members, and projects. Making it easy to track long-term progress and discussions.',
  },
  {
    question: 'What integrations does Ellie support?',
    answer:
      'Ellie works seamlessly with Google Meet, Zoom, and Microsoft Teams, with Slack and Notion integrations coming soon.',
  },
  {
    question: 'Is my meeting data private and secure?',
    answer:
      'Absolutely. Ellie encrypts all meeting data end-to-end and stores it securely, ensuring your conversations stay confidential.',
  },
  {
    question: 'Does Ellie provide follow-up summaries automatically?',
    answer:
      'Yes. After every meeting, Ellie sends a neatly organized summary with action items, decisions, and references to previous related discussions.',
  },
  {
    question: 'Can I search through past meetings?',
    answer:
      'You can and it’s fast. Ellie’s smart memory lets you search by keyword, topic, or participant and instantly find relevant moments from any meeting.',
  },
];

export function FAQ(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-12 md:py-16" aria-labelledby="faq-heading">
      <div className="container-ellie">
        <h2 id="faq-heading" className="text-[28px] md:text-[36px] font-extrabold text-ellieBlack mb-6">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={item.question} className="rounded-[5px] shadow-sm">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className={`w-full text-left px-5 py-4 rounded-[5px] border border-black/10 flex items-center justify-between transition ${
                    isOpen ? 'bg-[#F4F7FA]' : 'bg-white'
                  }`}
                >
                  <span className="text-[18px] md:text-[20px] font-bold text-ellieBlack">{item.question}</span>
                  <svg
                    className={`h-5 w-5 text-ellieBlack transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <div id={`faq-panel-${idx}`} className="px-5 pb-5 text-[16px] text-ellieBlack/80 bg-white rounded-b-[5px] border-x border-b border-black/10">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}


