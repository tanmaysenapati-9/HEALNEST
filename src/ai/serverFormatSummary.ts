import { generateContentWithRotation, GEMINI_MODEL } from './keyRotation.js'
import type { StructuredContext, AssessmentResult } from '../engine/types.js'

export async function performSummaryFormatting(
  context: StructuredContext,
  result: AssessmentResult,
  language: string,
  apiKeys: string[],
  caregiverContext: string = 'Me'
): Promise<string | null> {
  if (!apiKeys || apiKeys.length === 0 || (apiKeys.length === 1 && (apiKeys[0].trim() === '' || apiKeys[0].includes('PLACEHOLDER')))) {
    return null
  }

  let prompt = `Summarize the following structured patient-reported data into 2-3 clear sentences for a healthcare professional. Use ONLY the information given. Do not add symptoms, causes, durations, or severity not explicitly listed. Do not diagnose. Respond in ${language}.

Data to summarize:
Category: ${context.category}
Original Description: ${context.freeTextDescription}
Answers: ${JSON.stringify(context.answers, null, 2)}
Red Flags Triggered: ${result.triggeredRedFlags.join(', ') || 'None'}
Outcome: ${result.outcome}`

  if (caregiverContext && caregiverContext !== 'Me') {
    prompt += `\nThis assessment is for ${caregiverContext}. Adjust pronouns and phrasing accordingly.`
  }

  try {
    const response = await generateContentWithRotation(apiKeys, {
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        temperature: 0.1,
      },
    })

    const text = response.text
    console.log('[HEALNEST BACKEND] Summary generated, length:', text?.length)
    if (text && text.trim().length > 0) return text.trim()

    throw new Error('Empty summary response')
  } catch (error) {
    console.error('[HEALNEST BACKEND] Summary Error:', error)
    throw error
  }
}
