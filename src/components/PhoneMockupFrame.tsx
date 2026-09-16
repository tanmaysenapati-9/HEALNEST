import type { ReactNode } from 'react'

interface PhoneMockupFrameProps {
  children: ReactNode
  className?: string
  rotation?: number // e.g. -4, 0, 4
  floating?: boolean
}

export function PhoneMockupFrame({
  children,
  className = '',
  rotation = 0,
  floating = false,
}: PhoneMockupFrameProps) {
  return (
    <div
      className={`relative transition-transform duration-500 ease-out ${className}`}
      style={{
        transform: `rotate(${rotation}deg)`,
      }}
    >
      {/* Outer Titanium Phone Bezel */}
      <div
        className={`
          relative rounded-[2.8rem] p-[7px] overflow-hidden select-none
          w-[230px] sm:w-[260px] md:w-[280px]
          ${floating ? 'animate-float' : ''}
        `}
        style={{
          background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 50%, #0a0e1a 100%)',
          boxShadow: `
            0 28px 64px -12px rgba(0, 0, 0, 0.75),
            0 12px 28px -8px rgba(0, 0, 0, 0.5),
            0 0 45px rgba(59, 130, 246, 0.14),
            inset 0 1px 1px rgba(255, 255, 255, 0.22),
            inset 0 -1px 2px rgba(0, 0, 0, 0.8)
          `,
          border: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {/* Inner Phone Display Frame */}
        <div className="relative rounded-[2.35rem] overflow-hidden dark:bg-heal-bg bg-heal-light border border-black/40 aspect-[9/19.5]">
          {/* Top Speaker & Dynamic Island / Camera Pill */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
            <div className="w-20 h-5 bg-black/90 backdrop-blur-md rounded-full flex items-center justify-between px-2.5 shadow-md border border-white/5">
              <div className="w-2 h-2 rounded-full bg-[#111827] border border-blue-500/30 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-blue-400/60" />
              </div>
              <div className="w-2.5 h-1 rounded-full bg-neutral-800" />
            </div>
          </div>

          {/* Screen Glass Reflection Sheen */}
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background: 'linear-gradient(130deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 35%, transparent 55%)',
            }}
            aria-hidden="true"
          />

          {/* Screen Content */}
          <div className="w-full h-full overflow-hidden flex flex-col">
            {children}
          </div>

          {/* Bottom Home Indicator Bar */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-24 h-1 rounded-full bg-white/30 backdrop-blur-sm" />
          </div>
        </div>
      </div>
    </div>
  )
}
