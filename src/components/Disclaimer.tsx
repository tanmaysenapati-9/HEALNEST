import { Info } from 'lucide-react'

export function Disclaimer() {
  return (
    <div className="flex items-center justify-center gap-2 text-xs text-heal-text-light-muted dark:text-heal-text-muted mt-6 text-center max-w-lg mx-auto">
      <Info size={14} className="flex-shrink-0" />
      <p>
        HEALNEST provides guidance, not medical diagnosis. For emergencies, contact emergency services immediately.
      </p>
    </div>
  )
}
