import { Card } from '../components'
import { Construction } from 'lucide-react'

/**
 * Placeholder page — shown for routes that will be built in later parts.
 * Each of these routes will be replaced with full implementations:
 * - /app/my-health → PART 4: Health history and past checks
 * - /app/symptoms  → PART 3: AI symptom checker with NLU
 * - /app/health-tips → PART 6: Personalized health tips
 * - /app/settings → PART 7: User settings and profile management
 */
interface PlaceholderPageProps {
  title: string
  partNumber: number
  description: string
}

export function PlaceholderPage({ title, partNumber, description }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <Card glass className="max-w-md text-center p-10">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 0 20px rgba(34,211,238,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <Construction size={28} className="text-heal-teal" />
        </div>
        <h2 className="font-display text-xl font-bold dark:text-white text-heal-text-light-heading mb-2">
          {title}
        </h2>
        <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted mb-4">
          {description}
        </p>
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs dark:text-heal-text-muted text-heal-text-light-muted backdrop-blur-md"
          style={{
            background: 'rgba(26, 34, 54, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          Coming in Part {partNumber}
        </div>
      </Card>
    </div>
  )
}
