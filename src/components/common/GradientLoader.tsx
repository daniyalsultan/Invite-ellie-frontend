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
      <div className={`relative w-64 overflow-hidden rounded-full bg-ie-bgAlt ${trackHeight}`}>
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-ie-blue via-ie-aqua to-ie-violet"
          style={{ animation: 'ellie-loader 2.6s ease-in-out infinite' }}
        />
      </div>
      {label && (
        <p className="font-dmSans text-sm font-semibold text-ie-text">
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


