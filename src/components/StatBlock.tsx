interface StatBlockProps {
  value: string
  label: string
  description?: string
  className?: string
}

export function StatBlock({ value, label, description, className = '' }: StatBlockProps) {
  return (
    <div className={`text-center p-6 ${className}`}>
      <div className="text-3xl md:text-4xl font-bold gradient-text mb-2">
        {value}
      </div>
      <div className="text-sm font-semibold dark:text-heal-text-heading text-heal-text-light-heading mb-1">
        {label}
      </div>
      {description && (
        <div className="text-xs dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
          {description}
        </div>
      )}
    </div>
  )
}
