import type { StructuredContext, AssessmentResult } from '../engine/types'

export async function formatSummary(
  context: StructuredContext,
  result: AssessmentResult,
  language: string = 'en',
  caregiverContext: string = 'Me'
): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch('/api/formatSummary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context, result, language, caregiverContext }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`)
    }

    const data = await response.json()
    return data.summary || null
  } catch (error) {
    console.error('[HEALNEST Formatting] Network summary failed:', error)
    return null // Return null to fallback to raw template gracefully
  }
}
