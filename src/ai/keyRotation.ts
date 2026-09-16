import { GoogleGenAI } from '@google/genai'

// Track per-key cooldown timestamps (key index → timestamp when it can be retried)
const keyCooldowns: Record<number, number> = {}

// Track current preferred key index
let currentKeyIndex = 0

// Cooldown period after a 429 rate limit (15 seconds allows rapid recovery on free tier)
const COOLDOWN_MS = 15_000

/**
 * Ordered list of compatible Gemini models.
 * If one model encounters a 429 quota limit or temporary 503 high-demand spike,
 * the rotation logic automatically tries the next model in the pool.
 */
export const GEMINI_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-flash-latest',
]

export const DEFAULT_GEMINI_MODEL = GEMINI_MODELS[0]
export const GEMINI_MODEL = DEFAULT_GEMINI_MODEL

/**
 * Get the next available key index that is not currently in cooldown.
 */
function getAvailableKeyIndex(apiKeys: string[]): number {
  const now = Date.now()
  for (let offset = 0; offset < apiKeys.length; offset++) {
    const idx = (currentKeyIndex + offset) % apiKeys.length
    const cooldownUntil = keyCooldowns[idx] || 0
    if (now >= cooldownUntil) {
      return idx
    }
  }
  // If all keys are in cooldown, pick the one that recovers soonest
  let soonestIdx = 0
  let soonestTime = Infinity
  for (let i = 0; i < apiKeys.length; i++) {
    const cooldownUntil = keyCooldowns[i] || 0
    if (cooldownUntil < soonestTime) {
      soonestTime = cooldownUntil
      soonestIdx = i
    }
  }
  return soonestIdx
}

/**
 * Wrapper for Gemini API calls that automatically handles:
 * 1. Key rotation across multiple API keys.
 * 2. Model failover across supported model variants if a specific model encounters quota/demand issues.
 * 3. Exponential backoff for transient 503 (high demand) and 500 errors.
 * 4. Safe logging that NEVER exposes the raw API keys.
 */
export async function generateContentWithRotation(
  apiKeys: string[],
  requestParams: any
) {
  if (!apiKeys || apiKeys.length === 0) {
    throw new Error('No API keys configured. Add GEMINI_API_KEY_1 to your .env file.')
  }

  const requestedModel = requestParams.model || DEFAULT_GEMINI_MODEL
  // Build model priority list: requested model first, followed by remaining models in the pool
  const candidateModels = [
    requestedModel,
    ...GEMINI_MODELS.filter(m => m !== requestedModel)
  ]

  let lastError: any = null

  for (const modelName of candidateModels) {
    let attempts = 0
    const maxAttempts = apiKeys.length

    while (attempts < maxAttempts) {
      const keyIdx = getAvailableKeyIndex(apiKeys)
      const apiKey = apiKeys[keyIdx]
      const ai = new GoogleGenAI({ apiKey })

      const currentParams = {
        ...requestParams,
        model: modelName,
      }

      try {
        const response = await ai.models.generateContent(currentParams)
        // Success — clear cooldown for this key
        delete keyCooldowns[keyIdx]
        currentKeyIndex = keyIdx
        return response
      } catch (err: any) {
        attempts++
        lastError = err
        const errMsg = err?.message || err?.toString() || 'Unknown error'
        const errMsgLower = errMsg.toLowerCase()

        const isQuota = errMsg.includes('429') || errMsg.includes('RESOURCE_EXHAUSTED') || errMsgLower.includes('quota')
        const isUnavailable = errMsg.includes('503') || errMsgLower.includes('unavailable') || errMsgLower.includes('high demand')
        const isInvalidKey = errMsg.includes('400') || errMsgLower.includes('api_key_invalid') || errMsgLower.includes('invalid api key')
        const isModelError = errMsg.includes('404') || errMsgLower.includes('not found') || errMsgLower.includes('no longer available')
        const isAuth = errMsg.includes('401') || errMsgLower.includes('unauthenticated') || errMsgLower.includes('permission denied')

        console.warn(
          `[HEALNEST AI] Model ${modelName} with Key ${keyIdx + 1}/${apiKeys.length} failed.`,
          `Category: ${isQuota ? 'QUOTA_EXHAUSTED' : isUnavailable ? 'SERVICE_UNAVAILABLE' : isInvalidKey ? 'INVALID_KEY' : isModelError ? 'MODEL_NOT_FOUND' : isAuth ? 'AUTH_ERROR' : 'OTHER_ERROR'}.`
        )

        if (isQuota) {
          keyCooldowns[keyIdx] = Date.now() + COOLDOWN_MS
          currentKeyIndex = (keyIdx + 1) % apiKeys.length
          // If this key is quota-exhausted for this model, try next key; if all keys quota-exhausted for this model, break to next model in pool
          if (attempts >= maxAttempts) {
            console.log(`[HEALNEST AI] All keys quota-limited on ${modelName}, failing over to next candidate model...`)
            break
          }
          continue
        }

        if (isUnavailable) {
          // Transient 503 high-demand spike — brief backoff and rotate key
          keyCooldowns[keyIdx] = Date.now() + 5_000
          currentKeyIndex = (keyIdx + 1) % apiKeys.length
          if (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, 600))
            continue
          }
          break
        }

        if (isModelError) {
          // Model sunset or not available — immediately move to next model
          break
        }

        if (isInvalidKey || isAuth) {
          currentKeyIndex = (keyIdx + 1) % apiKeys.length
          if (attempts >= maxAttempts) {
            throw new Error('AUTH_FAILED')
          }
          continue
        }

        // For other unexpected errors, try next model
        break
      }
    }
  }

  // If all models and keys failed
  const finalErrMsg = lastError?.message?.toLowerCase() || ''
  if (finalErrMsg.includes('quota') || finalErrMsg.includes('429') || finalErrMsg.includes('resource_exhausted')) {
    throw new Error('ALL_KEYS_EXHAUSTED')
  }
  if (finalErrMsg.includes('unauthenticated') || finalErrMsg.includes('permission denied') || finalErrMsg.includes('401')) {
    throw new Error('AUTH_FAILED')
  }

  throw lastError || new Error('ALL_KEYS_EXHAUSTED')
}
