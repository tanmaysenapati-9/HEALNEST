import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glass?: boolean
  hover?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

export function Card({ children, className = '', glass = true, hover = false, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        relative group rounded-2xl p-6 transition-all duration-300 ease-out
        ${glass
          ? 'backdrop-blur-xl dark:bg-[rgba(8,13,26,0.55)] bg-heal-light-card/95'
          : 'dark:bg-heal-bg-card bg-heal-light-card'
        }
        ${hover
          ? 'hover:-translate-y-1 cursor-pointer'
          : ''
        }
        ${className}
      `}
      style={{
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(34,211,238,0.03), inset 0 1px 1px rgba(255,255,255,0.08)',
        ...style
      }}
      onMouseEnter={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6), 0 0 50px rgba(34,211,238,0.08), inset 0 1px 1px rgba(255,255,255,0.1)'
        e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.25)'
      } : undefined}
      onMouseLeave={hover ? (e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.5), 0 0 40px rgba(34,211,238,0.03), inset 0 1px 1px rgba(255,255,255,0.08)'
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'
      } : undefined}
    >
      {/* Animated Shine Effect on Hover */}
      {hover && (
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700 overflow-hidden rounded-2xl">
           <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
