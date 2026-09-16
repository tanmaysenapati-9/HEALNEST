import { Activity } from 'lucide-react'

interface LoadingPulseProps {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LoadingPulse({
  label = 'Processing health data...',
  size = 'md',
  className = '',
}: LoadingPulseProps) {
  const sizeMap = {
    sm: { container: 'p-3', icon: 16, text: 'text-xs' },
    md: { container: 'p-4', icon: 20, text: 'text-sm' },
    lg: { container: 'p-6', icon: 24, text: 'text-base' },
  }

  const { container, icon, text } = sizeMap[size]

  return (
    <div
      className={`inline-flex items-center gap-4 rounded-2xl glass-card ${container} ${className}`}
      role="status"
      aria-label={label}
    >
      <div className="relative flex items-center justify-center">
        {/* Radiating pulse rings */}
        <span className="absolute w-12 h-12 rounded-full border border-heal-teal/30 animate-ping opacity-60" />
        <span className="absolute w-8 h-8 rounded-full border border-heal-blue/40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]" />
        
        {/* Scanning radar line */}
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent to-heal-teal/40 origin-right animate-[spin_2s_linear_infinite]" />
        </div>

        {/* Glow icon badge */}
        <div
          className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-white backdrop-blur-md"
          style={{ boxShadow: '0 0 20px rgba(34,211,238,0.5)' }}
        >
          <Activity size={icon} className="animate-pulse text-white" />
        </div>
      </div>
      <span className={`font-semibold dark:text-heal-text text-heal-text-light ${text} animate-pulse`}>
        {label}
      </span>
    </div>
  )
}
