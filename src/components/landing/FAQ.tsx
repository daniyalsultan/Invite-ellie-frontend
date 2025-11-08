import { useState } from 'react';

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
      "You can and it's fast. Ellie's smart memory lets you search by keyword, topic, or participant and instantly find relevant moments from any meeting.",
  },
];

export function FAQ(): JSX.Element {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="w-full py-[70px] md:py-[90px]" aria-labelledby="faq-heading">
      <div className="container-ellie flex flex-col items-center gap-[35px] text-center">
        <h2
          id="faq-heading"
          className="font-poppins text-[30px] font-semibold leading-[1.5] tracking-[-0.05em] text-ellieBlack md:text-[40px]"
        >
          Frequently Asked Questions
        </h2>

        <div className="flex w-full max-w-[830px] flex-col gap-[15px] text-left">
          {FAQ_ITEMS.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={item.question}
                className="overflow-hidden rounded-[5px] shadow-[0_4px_10px_rgba(0,0,0,0.25)] transition"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between gap-[30px] bg-ellieBlue px-[25px] py-[23px] text-left"
                >
                  <span className="font-nunito text-[18px] font-bold leading-[1.364] text-white md:text-[20px]">
                    {item.question}
                  </span>
                  <svg
                    className={`h-5 w-5 text-white transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20"
                    fill="none"
                    aria-hidden
                  >
                    <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {isOpen && (
                  <div
                    id={`faq-panel-${idx}`}
                    className="bg-[#F2F9FD] px-[34px] py-[19px] font-nunito text-[18px] leading-[1.364] text-ellieBlack"
                  >
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


