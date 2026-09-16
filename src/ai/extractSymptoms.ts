import {
  SymptomExtractionResultSchema,
  type SymptomExtractionResult,
} from './extractionSchema'

/**
 * Client-Side AI Symptom Extraction Caller
 *
 * Calls the secure server endpoint `/api/extract` which holds the Anthropic API key.
 *
 * CRITICAL CONSTRAINT:
 * This layer does NOT compute outcomes, urgency, or medical advice.
 * It merely converts free-text user descriptions into structured fields.
 */

export async function extractSymptoms(text: string, language: string = 'en'): Promise<SymptomExtractionResult> {
  const trimmed = text.trim()
  if (!trimmed) {
    return {
      category: 'unrecognized',
      extractedFields: {},
      originalText: text,
      confidence: 'low',
    }
  }

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

    const response = await fetch('/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: trimmed, language }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Server returned status ${response.status}`)
    }

    const data = await response.json()
    const parsed = SymptomExtractionResultSchema.safeParse(data)

    if (parsed.success) {
      return parsed.data
    }

    console.warn('[HEALNEST NLU] API response did not match schema:', parsed.error)
    return {
      category: 'unrecognized',
      extractedFields: {},
      originalText: trimmed,
      confidence: 'low',
    }
  } catch (error) {
    console.error('[HEALNEST NLU] Network extraction failed:', error)
    throw error
  }
}
