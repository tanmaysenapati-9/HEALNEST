import type { ExplainedPathway } from './serverExplanation'
import type { AssessmentOutcome, CarePathwayTemplate } from '../engine/types'

/**
 * Client-Side AI Explanation Caller
 *
 * Calls the secure server endpoint `/api/explain` which holds the Anthropic API key.
 *
 * CRITICAL CONSTRAINT:
 * This layer only rewrites the structured medical advice into plain language.
 * Validation guardrails ensure no new diagnostic claims are presented to the user.
 */

const FORBIDDEN_PHRASES = [
  'diagnosed with',
  'diagnosis is',
  'you have',
  'definitely',
  'it is certain',
  'i can confirm',
]

function passesGuardrail(pathway: ExplainedPathway): boolean {
  const allText = [
    ...pathway.whatToDoNow,
    ...pathway.whatToMonitor,
    ...pathway.whenToSeekImmediateCare,
  ].join(' ').toLowerCase()

  for (const phrase of FORBIDDEN_PHRASES) {
    if (allText.includes(phrase)) {
      console.warn(`[HEALNEST Safety Guardrail] AI explanation rejected due to forbidden phrase: "${phrase}"`)
      return false
    }
  }

  return true
}

export async function explainCarePathway(
  outcome: AssessmentOutcome,
  reason: string,
  carePathwayTemplate: CarePathwayTemplate,
  language: string = 'en',
  caregiverContext: string = 'Me'
): Promise<ExplainedPathway | null> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch('/api/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ outcome, reason, carePathwayTemplate, language, caregiverContext }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`)
    }

    const data = await response.json()
    
    if (data && data.whatToDoNow && data.whatToMonitor && data.whenToSeekImmediateCare) {
      if (passesGuardrail(data as ExplainedPathway)) {
        return data as ExplainedPathway
      }
    }
    
    return null
  } catch (error) {
    console.error('[HEALNEST Explanation] Network explanation failed:', error)
    return null // Return null to fallback to raw template gracefully
  }
}
