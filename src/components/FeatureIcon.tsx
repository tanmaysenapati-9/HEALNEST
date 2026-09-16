import type { ReactNode } from 'react'

interface FeatureIconProps {
  icon: ReactNode
  label: string
  description?: string
  variant?: 'glass' | 'solid'
  className?: string
}

export function FeatureIcon({ icon, label, description, variant = 'solid', className = '' }: FeatureIconProps) {
  return (
    <div className={`flex flex-col items-center text-center gap-3 p-4 ${className}`}>
      {/* Icon badge — gradient glass or solid with emitted glow */}
      <div className={variant === 'glass' ? 'icon-badge' : 'icon-badge-solid'}>
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-semibold dark:text-heal-text-heading text-heal-text-light-heading mb-1">
          {label}
        </h4>
        {description && (
          <p className="text-xs dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
