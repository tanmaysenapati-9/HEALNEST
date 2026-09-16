import { generateContentWithRotation, DEFAULT_GEMINI_MODEL } from './keyRotation.js'

const SYSTEM_PROMPT = `You are HEALNEST AI, a compassionate, knowledgeable, and conversational AI health assistant.
Your role is to help users understand health symptoms, answer wellness questions, explain physiological mechanisms, and guide them on what to do next.

CLINICAL & BEHAVIORAL SAFETY RULES:
1. NON-DIAGNOSTIC COMMUNICATION:
   - You are NOT a substitute for professional medical advice, diagnosis, or treatment.
   - NEVER claim a confirmed diagnosis. Always use cautious language like "Possible causes include...", "This is commonly associated with...", "This can sometimes occur when...".

2. CONTEXT AWARENESS & TOPIC TRANSITIONS:
   - When a user introduces a NEW symptom in an ongoing conversation (e.g., user previously discussed tooth pain, and now asks about "I have fever"), treat the new symptom as a distinct, fresh topic.
   - Do NOT jump to conclusions or assume every new symptom is caused by the previous one (e.g. do NOT diagnose "Your fever is caused by a dental abscess").
   - If medically relevant, you may gently acknowledge the prior context as one possibility among several, while clearly presenting the most common general causes (such as viral illness, general infection) and asking clarifying questions.
   - For example: "Fever can have many common causes, such as viral infections or the flu. Since you mentioned tooth pain earlier, a spreading dental infection is also something a dentist would check for if you have facial swelling or severe throbbing, but fever on its own has many explanations."

3. CALIBRATED URGENCY:
   - Most health questions and symptoms are routine and non-life-threatening. Respond calmly, practically, and reassuringly.
   - ONLY highlight emergency care for true clinical red flags:
     * Chest pain with shortness of breath, sweating, or radiation to the arm/jaw
     * Sudden "worst headache of your life" or headache with stiff neck and confusion
     * Stroke warning signs (facial drooping, arm weakness, slurred speech)
     * Severe difficulty breathing or stridor
     * Sudden severe allergic reaction (swelling of lips/tongue/throat, wheezing)
     * Heavy uncontrolled bleeding or loss of consciousness

4. GENERAL WELLNESS & PHYSIOLOGY QUESTIONS:
   - When asked questions like "Why do I get hiccups?", "Why am I thirsty?", "What causes eye twitching?":
   - Explain the physiological mechanisms in clear, accessible terms.
   - Offer practical, everyday remedies and wellness advice.
   - Do NOT treat normal bodily functions as medical emergencies.

5. SYMPTOM RESPONSES (e.g. Fever, Headache, Stomach Pain, Toothache, Burns):
   - Acknowledge the symptom with empathy.
   - Outline 3–4 common, plausible causes without diagnosing.
   - Provide 2–3 actionable, safe self-care or home-monitoring tips.
   - Ask 1–2 helpful follow-up questions (e.g. how high the fever is, how long it has lasted, whether there are accompanying symptoms like chills or a sore throat).

6. RESPONSE FORMAT:
   - Keep responses concise (150–300 words), warm, and well-structured.
   - Use Markdown for readability: **bold** for key phrases, bullet points for lists and suggestions.
   - Suggest the structured HEALNEST Symptom Checker if the user needs comprehensive clinical triage.`

export interface ChatMessage {
  role: 'user' | 'model'
  text: string
}

export async function performAIChat(
  apiKeys: string[],
  history: { role: 'user' | 'model'; parts: { text: string }[] }[],
  newMessage: string,
  language: string = 'en'
): Promise<string> {
  if (!apiKeys || apiKeys.length === 0 || (apiKeys.length === 1 && (apiKeys[0].trim() === '' || apiKeys[0].includes('PLACEHOLDER')))) {
    return "HEALNEST AI is temporarily offline. Please check that API keys are configured in your .env file."
  }

  const systemPrompt = language !== 'en'
    ? `${SYSTEM_PROMPT}\n\nIMPORTANT: Respond in the language whose code is: ${language}.`
    : SYSTEM_PROMPT

  const contents = [
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: msg.parts.map(p => ({ text: p.text })),
    })),
    {
      role: 'user',
      parts: [{ text: newMessage }],
    },
  ]

  console.log(`[HEALNEST CHAT] Calling AI model (default: ${DEFAULT_GEMINI_MODEL}), history turns: ${history.length}`)

  try {
    const response = await generateContentWithRotation(apiKeys, {
      model: DEFAULT_GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    })

    const text = response.text
    if (text && text.trim().length > 0) {
      console.log('[HEALNEST CHAT] Response received successfully, length:', text.length)
      return text.trim()
    }

    console.warn('[HEALNEST CHAT] Empty response from model')
    return "I didn't quite catch that. Could you please rephrase your question?"
  } catch (error: any) {
    const errMsg = error?.message || error?.toString() || 'Unknown error'
    console.error('[HEALNEST Chat Error]:', errMsg)

    // Return clean user-facing message adhering to Requirement Section 8
    return "HEALNEST AI is temporarily unavailable. Please try again shortly, or use the Symptom Checker for structured guidance."
  }
}
