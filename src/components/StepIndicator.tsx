import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: 'Symptoms' },
    { num: 2, label: 'Details' },
    { num: 3, label: 'Guidance' },
  ]

  return (
    <div className="w-full max-w-md mx-auto mb-8 select-none" aria-label="Assessment progress">
      <div className="flex items-center justify-between relative">
        {/* Background connecting track */}
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />

        {/* Active connecting track */}
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-primary -z-0 transition-all duration-300"
          style={{
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : 'calc(100% - 3rem)',
          }}
        />

        {steps.map((step) => {
          const isCompleted = step.num < currentStep
          const isActive = step.num === currentStep
          const isPending = step.num > currentStep

          return (
            <div key={step.num} className="relative z-10 flex flex-col items-center gap-1.5">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs
                  transition-all duration-500 relative
                  ${
                    isCompleted
                      ? 'bg-gradient-primary text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                      : isActive
                      ? 'bg-heal-bg-card border-2 border-heal-teal text-white shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-110'
                      : 'bg-heal-bg-elevated border border-white/10 text-heal-text-muted backdrop-blur-md'
                  }
                `}
              >
                {isActive && (
                  <div className="absolute inset-0 rounded-full border border-heal-teal animate-ping opacity-20"></div>
                )}
                {isCompleted ? <Check size={16} className="text-white" /> : step.num}
              </div>
              <span
                className={`text-[11px] font-medium tracking-wide ${
                  isActive
                    ? 'text-white font-semibold'
                    : isCompleted
                    ? 'text-heal-text-muted'
                    : 'text-heal-text-muted/60'
                }`}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
