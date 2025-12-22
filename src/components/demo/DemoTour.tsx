import { useEffect, useMemo, useState } from 'react';

import demo1 from '../../assets/demo-1.png';
import demo2 from '../../assets/demo-2.png';
import demo3 from '../../assets/demo-3.png';
import demo4 from '../../assets/demo-4.png';
import logo from '../../assets/logo.svg';

interface TourStep {
  id: number;
  title: string;
  description: string;
  image: string;
  badge?: string;
}

interface DemoTourProps {
  defaultOpen?: boolean;
  initialStep?: number; // 0-based index
  onClose?: () => void;
}

export function DemoTour({
  defaultOpen = true,
  initialStep = 0,
  onClose,
}: DemoTourProps): JSX.Element | null {
  const steps: TourStep[] = useMemo(
    () => [
      {
        id: 1,
        title: 'Search for something',
        description:
          "Use the search bar at the top to quickly find any meeting, transcript, or note. Ellie keeps everything organized, so your past conversations are always easy to locate.",
        image: demo1,
        badge: '1',
      },
      {
        id: 2,
        title: 'Create or join a meeting',
        description:
          'Start a workspace, record a meeting, or join one. Use quick actions to get going in seconds.',
        image: demo2,
        badge: '2',
      },
      {
        id: 3,
        title: 'Review recent activity',
        description:
          'See transcription notes and meeting recordings as they arrive. Jump back in with a click.',
        image: demo3,
        badge: '3',
      },
      {
        id: 4,
        title: 'Organize in folders',
        description:
          'Create folders and keep your workspace tidy. Everything stays searchable and shareable.',
        image: demo4,
        badge: '4',
      },
    ],
    [],
  );

  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  const [index, setIndex] = useState<number>(Math.min(Math.max(initialStep, 0), steps.length - 1));
  const current = steps[index];

  // Respond to initialStep changes (e.g., when driven by route query)
  useEffect(() => {
    const clamped = Math.min(Math.max(initialStep, 0), steps.length - 1);
    setIndex(clamped);
  }, [initialStep, steps.length]);

  if (!isOpen) return null;

  const close = (): void => {
    setIsOpen(false);
    onClose?.();
  };

  const goNext = (): void => {
    if (index < steps.length - 1) {
      setIndex((v) => v + 1);
      return;
    }
    close();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4 md:p-8">
      <div className="relative w-full max-w-[1100px] rounded-[5px] bg-white p-4 shadow-2xl md:p-8">
        {/* Header */}
        <div className="mb-4 md:mb-6">
          <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-3">
            <img
              src={logo}
              alt="Invite Ellie"
              className="h-12 w-12 md:h-20 md:w-20"
            />
            <div className="text-center md:text-left">
              <h2 className="font-nunito text-xl font-extrabold text-ellieBlack md:text-3xl">
                Welcome to Invite Ellie
              </h2>
              <p className="font-nunito text-xs text-[#545454] md:text-base">
                Let’s walk you trough Invite Ellie and it’s features!
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          {/* Left: plain demo image, no borders or overlays */}
          <div className="md:col-span-3">
            <img
              src={current.image}
              alt={current.title}
              className="mx-auto h-auto w-full max-w-[520px] md:max-w-none"
            />
          </div>

          {/* Right: badge + copy, top-aligned with image */}
          <div className="flex flex-col md:col-span-2">
            <div className="mb-4 flex items-center gap-3">
              {/* Mobile step badge */}
              <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#327AAD] font-nunito text-xs font-extrabold text-white md:hidden">
                {current.badge}
              </div>
              <div className="hidden h-9 w-9 items-center justify-center rounded-full bg-[#327AAD] font-nunito text-sm font-extrabold text-white md:inline-flex">
                {current.badge}
              </div>
              <h3 className="font-nunito text-base font-extrabold text-ellieBlack md:text-2xl">
                {current.title}
              </h3>
            </div>
            <p className="font-nunito text-sm leading-relaxed text-[#545454] md:text-lg">
              {current.description}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 md:mt-8">
          {/* Progress bar - full width */}
          <div className="mb-4 flex w-full items-center gap-8">
            {steps.map((_, i) => (
              <div
                key={`step-${i}`}
                className={`h-[3px] flex-1 rounded-full ${
                  i <= index ? 'bg-[#327AAD]' : 'bg-[#E6E9F2]'
                }`}
              />
            ))}
          </div>
          {/* Actions below progress */}
          <div className="flex w-full items-center justify-between">
            <button
              type="button"
              onClick={close}
              className="rounded-[8px] px-4 py-2 font-nunito text-sm font-bold text-[#111928] hover:bg-[#F4F8FB]"
            >
              Skip demo
            </button>
            <div className="flex items-center gap-3">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => setIndex((v) => Math.max(0, v - 1))}
                  className="rounded-[8px] px-4 py-2 font-nunito text-sm font-semibold text-[#111928] hover:bg-[#F4F8FB]"
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                onClick={goNext}
                className="rounded-[8px] bg-[#327AAD] px-6 py-2 font-nunito text-sm font-extrabold text-white hover:bg-[#286996]"
              >
                {index === steps.length - 1 ? 'Finish' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


