type GradientLoaderProps = {
  label?: string;
  showElephant?: boolean;
  className?: string;
  size?: 'sm' | 'md';
};

const ELEPHANT_LOGO_SRC = '/logo-favicon.svg';

export function GradientLoader({
  label = 'For unforgettable meetings!',
  showElephant = true,
  className,
  size = 'md',
}: GradientLoaderProps): JSX.Element {
  const trackHeight = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className={`flex flex-col items-center gap-4 text-center ${className ?? ''}`}>
      {showElephant && (
        <img
          src={ELEPHANT_LOGO_SRC}
          alt="Ellie mascot"
          className="h-16 w-16 select-none object-contain"
          draggable={false}
        />
      )}
      <div className={`relative w-64 overflow-hidden rounded-full bg-[#E4E8F2] ${trackHeight}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[#1F6FB5] via-[#7CFBF4] to-[#7C5CFF]"
          style={{ animation: 'ellie-loader 2.6s ease-in-out infinite' }}
        />
      </div>
      {label && (
        <p className="font-nunito text-sm font-semibold text-[#111928]">
          {label}
        </p>
      )}
    </div>
  );
}

type FullScreenLoaderProps = {
  label?: string;
};

export function FullScreenLoader({ label }: FullScreenLoaderProps): JSX.Element {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <GradientLoader label={label} />
    </div>
  );
}


