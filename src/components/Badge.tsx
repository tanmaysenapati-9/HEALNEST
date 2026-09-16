import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'teal' | 'gradient' | 'red' | 'amber' | 'blue'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default:
      'dark:bg-[rgba(26,34,54,0.4)] bg-heal-light-secondary/80 dark:text-heal-text-muted text-heal-text-light-muted backdrop-blur-md border dark:border-[rgba(255,255,255,0.08)] border-heal-border-accent shadow-[0_0_10px_rgba(255,255,255,0.02)]',
    teal: 'bg-heal-teal/10 text-heal-teal backdrop-blur-md border dark:border-[rgba(34,211,238,0.3)] border-heal-teal/20 shadow-[0_0_15px_rgba(34,211,238,0.15)]',
    gradient:
      'bg-gradient-primary text-white border-none shadow-btn-glow',
    red: 'bg-red-500/15 text-red-500 backdrop-blur-md border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
    amber: 'bg-amber-500/15 text-amber-500 backdrop-blur-md border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    blue: 'bg-cyan-500/15 text-cyan-500 backdrop-blur-md border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]',
  }

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
