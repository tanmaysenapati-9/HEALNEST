import { generateContentWithRotation, GEMINI_MODEL } from './keyRotation.js'
import { z } from 'zod'
import type { AssessmentOutcome, CarePathwayTemplate } from '../engine/types.js'

const ExplainedPathwaySchema = z.object({
  whatToDoNow: z.array(z.string()),
  whatToMonitor: z.array(z.string()),
  whenToSeekImmediateCare: z.array(z.string()),
})

export type ExplainedPathway = z.infer<typeof ExplainedPathwaySchema>

const SYSTEM_PROMPT = `You are a clinical communication assistant. Your task is to rewrite structured health guidance (bullet points) into warm, clear, plain language for a general audience.
CRITICAL RULES:
1. Do NOT add any new advice, symptoms, or recommendations beyond what is given.
2. Do NOT change the severity, urgency, or meaning of the original text.
3. Do NOT use definitive diagnostic language (e.g., avoid "you have X", "you are diagnosed with"; prefer "this may be" or "based on what you described").
4. Keep it concise, accessible, and empathetic.
5. Return exactly the same three sections as a raw JSON object — no markdown, no code fences.

Output format:
{
  "whatToDoNow": ["string", ...],
  "whatToMonitor": ["string", ...],
  "whenToSeekImmediateCare": ["string", ...]
}`

export async function performAIExplanation(
  apiKeys: string[],
  outcome: AssessmentOutcome,
  reason: string,
  carePathwayTemplate: CarePathwayTemplate,
  language: string,
  caregiverContext: string = 'Me'
): Promise<ExplainedPathway | null> {
  if (!apiKeys || apiKeys.length === 0 || (apiKeys.length === 1 && (apiKeys[0].trim() === '' || apiKeys[0].includes('PLACEHOLDER')))) {
    return null
  }

  let systemPrompt = `${SYSTEM_PROMPT} Respond in ${language}.`
  if (caregiverContext && caregiverContext !== 'Me') {
    systemPrompt += ` This assessment is for ${caregiverContext}. Adjust pronouns and phrasing accordingly (e.g. 'your child' instead of 'you').`
  }

  const contentToRewrite = `
Outcome: ${outcome}
Reasoning: ${reason}
Original Guidance:
- What To Do Now: ${JSON.stringify(carePathwayTemplate.whatToDoNow)}
- What To Monitor: ${JSON.stringify(carePathwayTemplate.whatToMonitor)}
- When to Seek Immediate Care:
${JSON.stringify(carePathwayTemplate.whenToSeekImmediateCare, null, 2)}
`

  try {
    const response = await generateContentWithRotation(apiKeys, {
      model: GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: `Rewrite the following guidance:\n\n${contentToRewrite}\n\nRespond ONLY with raw JSON.` }] }],
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
      },
    })

    const rawText = response.text || ''
    const cleaned = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsedData = JSON.parse(cleaned)
    const parsed = ExplainedPathwaySchema.safeParse(parsedData)
    if (parsed.success) return parsed.data

    return null
  } catch (error) {
    console.error('[HEALNEST Explanation Error] Gemini explanation failed:', error)
    return null
  }
}
