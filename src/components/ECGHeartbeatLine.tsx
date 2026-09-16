interface ECGHeartbeatLineProps {
  className?: string
}

export function ECGHeartbeatLine({ className = '' }: ECGHeartbeatLineProps) {
  // Realistic medical cardiogram waveform (P-Q-R-S-T sequence repeated)
  // Baseline is at y=45 in a viewBox of 0 0 1000 90
  const pathData = `
    M 0 45
    L 90 45
    Q 105 37 120 45
    L 145 45
    L 155 49
    L 170 12
    L 185 76
    L 195 45
    L 220 45
    Q 245 32 270 45
    L 370 45
    Q 385 37 400 45
    L 425 45
    L 435 49
    L 450 12
    L 465 76
    L 475 45
    L 500 45
    Q 525 32 550 45
    L 650 45
    Q 665 37 680 45
    L 705 45
    L 715 49
    L 730 12
    L 745 76
    L 755 45
    L 780 45
    Q 805 32 830 45
    L 1000 45
  `

  return (
    <div
      className={`relative w-full overflow-hidden pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-full h-[70px] sm:h-[90px]"
        viewBox="0 0 1000 90"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Glowing linear gradient along pulse */}
          <linearGradient id="ecg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.1" />
            <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.9" />
            <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
          </linearGradient>

          {/* Core pulse glow filter */}
          <filter id="ecg-glow" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Faint static cardiogram baseline trace */}
        <path
          d={pathData}
          stroke="currentColor"
          strokeWidth="1.2"
          className="text-heal-blue/15 dark:text-heal-blue/20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Primary active animated drawing pulse */}
        <path
          d={pathData}
          stroke="url(#ecg-gradient)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecg-glow)"
          className="animate-ecg-draw"
          strokeDasharray="180 820"
        />
      </svg>
    </div>
  )
}
