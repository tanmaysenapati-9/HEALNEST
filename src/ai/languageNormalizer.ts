import { generateContentWithRotation, DEFAULT_GEMINI_MODEL } from './keyRotation.js'

// ─────────────────────────────────────────────────────────────────────────────
// SCRIPT DETECTION (Unicode range checks — zero external dependencies)
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the text contains Devanagari script (Hindi, Marathi, Nepali…) */
export function containsDevanagari(text: string): boolean {
  return /[\u0900-\u097F]/.test(text)
}

/** Returns true if the text contains Tamil script */
export function containsTamil(text: string): boolean {
  return /[\u0B80-\u0BFF]/.test(text)
}

/** Returns the detected script, or 'latin' for English/Romanized input */
export type DetectedScript = 'devanagari' | 'tamil' | 'latin'

export function detectScript(text: string): DetectedScript {
  if (containsDevanagari(text)) return 'devanagari'
  if (containsTamil(text)) return 'tamil'
  return 'latin'
}

// ─────────────────────────────────────────────────────────────────────────────
// STATIC SYMPTOM DICTIONARIES  (offline-first, quota-safe)
// Keys are lowercase substrings to match against; values are English equivalents.
// More specific phrases are listed first so they win over partial matches.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hindi → English symptom normalization map.
 * Covers common natural-language variations, not just dictionary forms.
 */
const HINDI_SYMPTOM_MAP: Array<[RegExp, string]> = [
  // Dental / tooth pain
  [/दांत\s*में\s*दर्द|दंत\s*दर्द|दांत\s*दर्द|दाँत\s*(में\s*)?दर्द|दांत\s+में\s+पीड़ा|दाँत\s+दुख/, 'my tooth hurts'],
  // Headache
  [/सिरदर्द|सिर\s*दर्द|सिर\s*(में\s*)?दर्द|सिर\s+में\s+पीड़ा|माइग्रेन|सिर\s+घूम/, 'I have a headache'],
  // Fever
  [/बुखार|ज्वर|तेज़?\s*बुखार|बुखार\s+है|बुखार\s+हो|बुखार\s+आया|बुखार\s+चढ़|पायरेक्सिया/, 'I have fever'],
  // Stomach / digestive
  [/पेट\s*(में\s*)?दर्द|पेट\s+दुखना|पेट\s+में\s+जलन|पेट\s+में\s+तकलीफ|पेट\s+ख़राब|गैस|एसिडिटी|अपच|उदर\s*शूल/, 'I have stomach pain'],
  // Cough
  [/खांसी|खाँसी|खांसना|सूखी\s+खांसी|बलगम/, 'I have a cough'],
  // Nausea / vomiting
  [/उल्टी|जी\s*मिचलाना|जी\s+मचलना|मतली|वमन|उबकाई/, 'I feel like vomiting'],
  // Diarrhea
  [/दस्त|डायरिया|पतले\s+दस्त|लूज़?\s+मोशन|बार\s*बार\s+(शौच|टॉयलेट)/, 'I have diarrhea'],
  // Chest pain
  [/सीने\s*(में\s*)?दर्द|छाती\s*(में\s*)?दर्द|सीना\s+दर्द|छाती\s+में\s+(जकड़न|जलन|भारीपन)/, 'I have chest pain'],
  // Back pain
  [/कमर\s*(में\s*)?दर्द|पीठ\s*(में\s*)?दर्द|कमर\s+दुखना|रीढ़\s*(में\s*)?दर्द|कमर\s+में\s+तकलीफ/, 'I have back pain'],
  // Dizziness
  [/चक्कर|सिर\s*चकराना|चक्कर\s+आना|सिर\s+घूमना|चक्करदार/, 'I feel dizzy'],
  // Fatigue
  [/थकान|थका\s+हुआ|थकावट|कमज़ोरी|ऊर्जा\s+नहीं|बहुत\s+थका/, 'I feel fatigued'],
  // Joint pain
  [/जोड़ों\s*(में\s*)?दर्द|जोड़\s*(में\s*)?दर्द|घुटने\s*(में\s*)?दर्द|कंधे\s*(में\s*)?दर्द|गठिया/, 'I have joint pain'],
  // Rash / itching
  [/खुजली|रैश|चकत्ते|त्वचा\s+(पर\s+)?लाल\s+धब्बे|पित्ती/, 'I have a rash and itching'],
  // Eye problem
  [/आंख\s*(में\s*)?दर्द|आँख\s*(में\s*)?जलन|आँख\s+लाल|धुंधला\s+दिखना|आँख\s+में\s+तकलीफ/, 'I have eye pain'],
  // Ear pain
  [/कान\s*(में\s*)?दर्द|कान\s+दर्द|कान\s+में\s+(दर्द|तकलीफ)|कान\s+बजना/, 'I have ear pain'],
  // Burning
  [/जलन|जला\s+दिया|जल\s+गया|गर्म\s+चीज़\s+से\s+जलना/, 'I have a burn'],
  // Fainting
  [/बेहोशी|बेहोश|होश\s+खोना|चक्कर\s+आकर\s+गिरना|मूर्छा/, 'I fainted'],
  // Mental health
  [/चिंता|घबराहट|डिप्रेशन|अवसाद|मानसिक\s+तनाव|पैनिक|बहुत\s+तनाव/, 'I have anxiety and stress'],
  // Muscle strain
  [/मांसपेशी\s*(में\s*)?दर्द|मसल्स\s+में\s+दर्द|मांसपेशी\s+खिंचना|मांसपेशी\s+में\s+ऐंठन/, 'I have muscle pain'],
  // Urinary
  [/पेशाब\s+(में\s*)?(जलन|दर्द|तकलीफ)|बार\s*बार\s+पेशाब|मूत्र\s+संक्रमण|यूटीआई/, 'I have painful urination'],
  // Constipation
  [/कब्ज़?|मल\s+नहीं\s+आना|शौच\s+नहीं\s+होना/, 'I am constipated'],
  // Blood in stool
  [/मल\s+में\s+खून|पाखाना\s+में\s+खून|टट्टी\s+में\s+खून/, 'I have blood in my stool'],
  // Shortness of breath  
  [/सांस\s+(लेने\s+में\s+)?(तकलीफ|दिक्कत)|सांस\s+फूलना|सांस\s+नहीं\s+आ|दम\s+फूलना/, 'I have shortness of breath'],
  // Numbness
  [/सुन्न|झनझनाहट|सुन्नपन|अंग\s+सुन्न/, 'I have numbness and tingling'],
  // Insect bite
  [/कीड़े\s*का\s*काटना|मच्छर\s*(ने\s*)?काटा|मधुमक्खी\s*(ने\s*)?काटा|बिच्छू\s*(ने\s*)?काटा/, 'I was bitten by an insect'],
  // Cuts / wounds
  [/कट\s+गया|चोट\s+लगी|घाव|खून\s+निकल\s+रहा|खरोंच/, 'I have a cut and wound'],
]

/**
 * Tamil → English symptom normalization map.
 */
const TAMIL_SYMPTOM_MAP: Array<[RegExp, string]> = [
  // Dental / tooth pain
  [/பல்\s*வலி|பற்\s*வலி|பல்லில்\s+வலி|பல்\s+வலிக்கிறது|பல்\s*வலி\s*இருக்கிறது/, 'my tooth hurts'],
  // Headache
  [/தலைவலி|தலையில்\s+வலி|தலை\s+வலிக்கிறது|மைக்கிரேன்|தலைசுற்றல்\s+வலி/, 'I have a headache'],
  // Fever
  [/காய்ச்சல்|காய்சல்|காய்ச்சல்\s+உள்ளது|காய்ச்சல்\s+இருக்கிறது|காய்ச்சல்\s+வருகிறது|ஜ்வரம்/, 'I have fever'],
  // Stomach / digestive
  [/வயிற்று\s*வலி|வயிற்றில்\s+வலி|வயிறு\s+வலிக்கிறது|வயிற்று\s+வலி\s+இருக்கிறது|வயிறு\s+எரிகிறது|அஜீரணம்|அமில\s+ஆதிக்கம்/, 'I have stomach pain'],
  // Cough
  [/இருமல்|இருமுகிறேன்|இருமல்\s+வருகிறது|சளி|க஫்/, 'I have a cough'],
  // Nausea / vomiting
  [/வாந்தி|குமட்டல்|வாந்தி\s+வருகிறது|வாந்தி\s+எடுக்கிறது|குமட்டுகிறது/, 'I feel like vomiting'],
  // Diarrhea
  [/வயிற்றுப்போக்கு|வயிற்று\s+போக்கு|டயேரியா|தளர்வான\s+மலம்/, 'I have diarrhea'],
  // Chest pain
  [/நெஞ்சு\s*வலி|நெஞ்சில்\s+வலி|மார்பு\s*வலி|நெஞ்சு\s+வலிக்கிறது|நெஞ்சு\s+இறுகுகிறது/, 'I have chest pain'],
  // Back pain
  [/முதுகு\s*வலி|முதுகில்\s+வலி|முதுகு\s+வலிக்கிறது|இடுப்பு\s+வலி/, 'I have back pain'],
  // Dizziness
  [/தலைச்சுற்றல்|சுற்றல்|தலை\s+சுற்றுகிறது|மயக்கம்\s+போல/, 'I feel dizzy'],
  // Fatigue
  [/சோர்வு|களைப்பு|சோர்வாக\s+இருக்கிற(து|ேன்|ீர்கள்)?|சக்தி\s+இல்லை|மிகவும்\s+களைத்தேன்/, 'I feel fatigued'],
  // Joint pain
  [/மூட்டு\s*வலி|மூட்டில்\s+வலி|முழங்கால்\s+வலி|தோள்\s+வலி|கீல்வாதம்/, 'I have joint pain'],
  // Rash / itching
  [/அரிப்பு|தடிப்பு|சொரி|தோலில்\s+(சிவப்பு\s+)?திட்டுக்கள்|படை/, 'I have a rash and itching'],
  // Eye problem
  [/கண்\s*வலி|கண்ணில்\s+வலி|கண்\s+எரிகிறது|பார்வை\s+மங்கல்|கண்\s+சிவக்கிறது/, 'I have eye pain'],
  // Ear pain
  [/காது\s*வலி|காதில்\s+வலி|காது\s+வலிக்கிறது|காது\s+கேக்கவில்லை|காது\s+சத்தம்/, 'I have ear pain'],
  // Burning / burn
  [/எரிச்சல்|தீக்காயம்|சுட்டது|சூடு\s+தட்டியது|கொப்புளம்/, 'I have a burn'],
  // Fainting
  [/மயக்கம்|மூர்ச்சை|மயங்கி\s+விழுந்தேன்|சுயநினைவு\s+இழந்தேன்/, 'I fainted'],
  // Mental health
  [/பதட்டம்|மனச்சோர்வு|கவலை|மன\s+அழுத்தம்|பயம்|பீதி/, 'I have anxiety and stress'],
  // Muscle pain
  [/தசை\s*வலி|தசை\s+வலிக்கிறது|தசை\s+இழுக்கிறது|தசைப்பிடிப்பு/, 'I have muscle pain'],
  // Urinary
  [/சிறுநீர்\s+(கழிக்க\s+)?வலி|சிறுநீர்\s+எரிச்சல்|அடிக்கடி\s+சிறுநீர்|சிறுநீர்\s+நோய்த்தொற்று/, 'I have painful urination'],
  // Constipation
  [/மலச்சிக்கல்|மலம்\s+கழிக்க\s+முடியவில்லை/, 'I am constipated'],
  // Blood in stool
  [/மலத்தில்\s+இரத்தம்|மலத்தில்\s+ரத்தம்/, 'I have blood in my stool'],
  // Shortness of breath
  [/மூச்சு\s*(விட\s*)?(சிரமம்|கஷ்டம்)|மூச்சு\s+திணறல்|மூச்சு\s+வருவதில்லை/, 'I have shortness of breath'],
  // Numbness
  [/மரத்துப்\s*போதல்|கூச்சம்|மரம்\s+மரமாக\s+இருக்கிறது|உணர்வு\s+இல்லை/, 'I have numbness and tingling'],
  // Insect bite
  [/பூச்சி\s*கடி|கொசு\s*கடி|தேனீ\s*கடி|தேள்\s*கடி/, 'I was bitten by an insect'],
  // Cuts / wounds
  [/காயம்|வெட்டு\s+காயம்|இரத்தம்\s+வருகிறது|கீறல்/, 'I have a cut and wound'],
]

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DICTIONARY LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tries to match the text against the static dictionary for a given script.
 * Returns a translated English phrase if found, otherwise null.
 * Multiple matches are concatenated (e.g. "I have fever and headache").
 */
function staticDictionaryLookup(
  text: string,
  map: Array<[RegExp, string]>
): string | null {
  const matches: string[] = []
  for (const [pattern, english] of map) {
    if (pattern.test(text) && !matches.includes(english)) {
      matches.push(english)
    }
  }
  return matches.length > 0 ? matches.join(' and ') : null
}

// ─────────────────────────────────────────────────────────────────────────────
// API-BASED TRANSLATION FALLBACK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calls the Gemini API to translate a symptom description to English.
 * Used only when the static dictionary doesn't match.
 * Returns the original text if translation fails.
 */
async function apiTranslateToEnglish(
  text: string,
  apiKeys: string[]
): Promise<string> {
  if (!apiKeys || apiKeys.length === 0) return text
  try {
    const response = await generateContentWithRotation(apiKeys, {
      model: DEFAULT_GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Translate the following health symptom description to English. Return ONLY the English translation — no explanations, no extra text.\n\nText: "${text}"`,
            },
          ],
        },
      ],
      config: {
        temperature: 0.1,
        systemInstruction:
          'You are a medical translation assistant. Translate symptom descriptions into English. Return ONLY the translated text. Never add explanations or disclaimers.',
      },
    })
    const translated = (response.text || '').trim()
    // Sanity check: if translation returned something empty or identical to input, fall back
    return translated && translated !== text ? translated : text
  } catch {
    return text // Fail silently — the extractor will handle it
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

export interface NormalizationResult {
  /** English-normalized symptom text to feed into the extraction pipeline */
  normalizedEnglish: string
  /** Detected input script */
  detectedScript: DetectedScript
  /** Whether the text needed normalization (false = was already Latin/English) */
  wasTranslated: boolean
}

/**
 * Detects the script of the input text and normalizes it to English if needed.
 *
 * Strategy (offline-first):
 * 1. If script is Latin → return as-is (English or Romanized, no translation needed)
 * 2. If script is Devanagari/Tamil → try static dictionary first (no API quota used)
 * 3. If static dictionary returns null → call Gemini API translation as fallback
 * 4. If API fails → return original text (extractor may still partially handle it)
 *
 * IMPORTANT: This function normalizes ONLY for NLU purposes.
 * The original verbatim user text is preserved separately in extractedFields.originalText.
 */
export async function normalizeToEnglish(
  text: string,
  apiKeys: string[]
): Promise<NormalizationResult> {
  const script = detectScript(text)

  if (script === 'latin') {
    return {
      normalizedEnglish: text,
      detectedScript: 'latin',
      wasTranslated: false,
    }
  }

  // Choose the right static map
  const map = script === 'devanagari' ? HINDI_SYMPTOM_MAP : TAMIL_SYMPTOM_MAP
  const staticResult = staticDictionaryLookup(text, map)

  if (staticResult) {
    console.log(`[HEALNEST NLU] Static map translation (${script}): "${text}" → "${staticResult}"`)
    return {
      normalizedEnglish: staticResult,
      detectedScript: script,
      wasTranslated: true,
    }
  }

  // Static map missed — try API translation
  console.log(`[HEALNEST NLU] Static map miss for ${script} input, calling API translation...`)
  const apiResult = await apiTranslateToEnglish(text, apiKeys)
  console.log(`[HEALNEST NLU] API translation (${script}): "${text}" → "${apiResult}"`)

  return {
    normalizedEnglish: apiResult,
    detectedScript: script,
    wasTranslated: apiResult !== text,
  }
}
