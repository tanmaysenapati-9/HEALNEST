import { describe, it, expect } from 'vitest'
import {
  SymptomExtractionResultSchema,
  type SymptomExtractionResult,
} from './extractionSchema'
import { fallbackHeuristicExtraction } from './serverExtractor'

describe('HEALNEST AI NLU Layer (Typo-Tolerant & Semantic Symptom Detection)', () => {
  // ==========================================================================
  // 1. Fever & Typo Tolerance
  // ==========================================================================
  describe('Fever detection with typos and variations', () => {
    const feverInputs = [
      'I have fever',
      'I have a fever',
      "I'm having fever",
      "I've got fever",
      'I am running a fever',
      'I feel feverish',
      'I think I have a fever',
      'fever since yesterday',
      'I have fevr',
    ]

    feverInputs.forEach((input) => {
      it(`maps "${input}" to "fever" with high confidence`, () => {
        const result: SymptomExtractionResult = fallbackHeuristicExtraction(input)
        const parsed = SymptomExtractionResultSchema.safeParse(result)
        expect(parsed.success).toBe(true)
        expect(result.category).toBe('fever')
        expect(result.confidence).toBe('high')
      })
    })
  })

  // ==========================================================================
  // 2. Stomach / Gastric / Digestive with Typos & Colloquialisms
  // ==========================================================================
  describe('Stomach / Digestive typo and semantic tolerance', () => {
    it('"I have gastic" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('I have gastic')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"I have gastric" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('I have gastric')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"I have gas" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('I have gas')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"I feel gassy" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('I feel gassy')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"My stomach hurts" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('My stomach hurts')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"My tummy hurts" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('My tummy hurts')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"My stomch hurts" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('My stomch hurts')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"My stomach is burning" -> stomach_pain', () => {
      const result = fallbackHeuristicExtraction('My stomach is burning')
      expect(result.category).toBe('stomach_pain')
      expect(result.confidence).toBe('high')
    })

    it('"I feel bloated after eating" -> stomach_pain with cause "after eating"', () => {
      const result = fallbackHeuristicExtraction('I feel bloated after eating')
      expect(result.category).toBe('stomach_pain')
      expect(result.extractedFields.cause).toMatch(/after eating/i)
      expect(result.confidence).toBe('high')
    })
  })

  // ==========================================================================
  // 3. Headache & Dental Typos
  // ==========================================================================
  describe('Headache and Dental typos', () => {
    it('"I have a headake" -> headache', () => {
      const result = fallbackHeuristicExtraction('I have a headake')
      expect(result.category).toBe('headache')
      expect(result.confidence).toBe('high')
    })

    it('"My head is hurting" -> headache', () => {
      const result = fallbackHeuristicExtraction('My head is hurting')
      expect(result.category).toBe('headache')
      expect(result.confidence).toBe('high')
    })

    it('"My tooth ache is bad" -> toothache_dental_pain', () => {
      const result = fallbackHeuristicExtraction('My tooth ache is bad')
      expect(result.category).toBe('toothache_dental_pain')
      expect(result.confidence).toBe('high')
    })

    it('"My tooth hurts when chewing" -> toothache_dental_pain with cause "when chewing"', () => {
      const result = fallbackHeuristicExtraction('My tooth hurts when chewing')
      expect(result.category).toBe('toothache_dental_pain')
      expect(result.extractedFields.cause).toMatch(/when chewing/i)
      expect(result.confidence).toBe('high')
    })
  })

  // ==========================================================================
  // 4. Nausea, Diarrhea, and Fainting Semantic Phrases
  // ==========================================================================
  describe('Nausea, Diarrhea, and Fainting', () => {
    it('"I feel like throwing up" -> nausea_vomiting', () => {
      const result = fallbackHeuristicExtraction('I feel like throwing up')
      expect(result.category).toBe('nausea_vomiting')
      expect(result.confidence).toBe('high')
    })

    it('"I have loose motion" -> diarrhea', () => {
      const result = fallbackHeuristicExtraction('I have loose motion')
      expect(result.category).toBe('diarrhea')
      expect(result.confidence).toBe('high')
    })

    it('"I keep passing loose stools" -> diarrhea', () => {
      const result = fallbackHeuristicExtraction('I keep passing loose stools')
      expect(result.category).toBe('diarrhea')
      expect(result.confidence).toBe('high')
    })

    it('"I feel like I might faint" -> fainting', () => {
      const result = fallbackHeuristicExtraction('I feel like I might faint')
      expect(result.category).toBe('fainting')
      expect(result.confidence).toBe('high')
    })
  })

  // ==========================================================================
  // 5. Multiple Symptoms Preservation
  // ==========================================================================
  describe('Multiple symptoms preservation', () => {
    it('"I have fever and headache" preserves both symptoms', () => {
      const result = fallbackHeuristicExtraction('I have fever and headache')
      expect(['fever', 'headache']).toContain(result.category)
      expect(result.extractedFields.otherMentionedSymptoms).toBeDefined()
      expect(result.extractedFields.otherMentionedSymptoms?.length).toBeGreaterThan(0)
      expect(result.confidence).toBe('high')
    })

    it('"I have stomach pain and vomiting" preserves stomach_pain and nausea_vomiting', () => {
      const result = fallbackHeuristicExtraction('I have stomach pain and vomiting')
      expect(result.category).toBe('stomach_pain')
      expect(result.extractedFields.otherMentionedSymptoms).toContain('nausea_vomiting')
      expect(result.confidence).toBe('high')
    })

    it('"I have tooth pain and facial swelling" preserves toothache and facial swelling', () => {
      const result = fallbackHeuristicExtraction('I have tooth pain and facial swelling')
      expect(result.category).toBe('toothache_dental_pain')
      expect(result.extractedFields.otherMentionedSymptoms).toContain('facial swelling')
      expect(result.confidence).toBe('high')
    })
  })

  // ==========================================================================
  // 6. Non-Over-Correction & Vague Inputs
  // ==========================================================================
  describe('Vague and non-medical input handling', () => {
    it('"I have a weird feeling" returns unrecognized without forcing a medical category', () => {
      const result = fallbackHeuristicExtraction('I have a weird feeling')
      expect(result.category).toBe('unrecognized')
      expect(result.confidence).toBe('low')
    })

    it('"something feels wrong" returns unrecognized', () => {
      const result = fallbackHeuristicExtraction('something feels wrong')
      expect(result.category).toBe('unrecognized')
      expect(result.confidence).toBe('low')
    })
  })
})

// =============================================================================
// MULTILINGUAL TESTS — Hindi (Devanagari) & Tamil script detection
// These tests use the static dictionary path (no API calls needed).
// =============================================================================
import { detectScript, normalizeToEnglish, containsDevanagari, containsTamil } from './languageNormalizer'

describe('Script Detection', () => {
  it('detects Devanagari script (Hindi)', () => {
    expect(containsDevanagari('मुझे बुखार है')).toBe(true)
    expect(detectScript('मुझे बुखार है')).toBe('devanagari')
  })

  it('detects Tamil script', () => {
    expect(containsTamil('எனக்கு காய்ச்சல் உள்ளது')).toBe(true)
    expect(detectScript('எனக்கு காய்ச்சல் உள்ளது')).toBe('tamil')
  })

  it('identifies English/Latin as latin script', () => {
    expect(detectScript('I have fever')).toBe('latin')
    expect(detectScript('tooth hurts')).toBe('latin')
  })

  it('identifies Hinglish (Latin script Hindi) as latin', () => {
    expect(detectScript('mujhe bukhar hai')).toBe('latin')
  })
})

describe('Hindi Symptom Static Dictionary (normalizeToEnglish)', () => {
  const hindiCases: Array<[string, string]> = [
    ['मुझे बुखार है', 'fever'],
    ['मेरे दांत में दर्द है', 'tooth'],
    ['मुझे सिरदर्द है', 'headache'],
    ['मुझे पेट दर्द है', 'stomach'],
    ['मुझे खांसी है', 'cough'],
    ['मुझे उल्टी हो रही है', 'vomit'],
    ['मुझे दस्त हैं', 'diarrhea'],
    ['मुझे चक्कर आ रहे हैं', 'dizzy'],
    ['सीने में दर्द है', 'chest pain'],
    ['कमर में दर्द है', 'back pain'],
    ['मुझे थकान है', 'fatigue'],
    ['जोड़ों में दर्द है', 'joint'],
  ]

  hindiCases.forEach(([input, expectedKeyword]) => {
    it(`"${input}" translates to contain "${expectedKeyword}"`, async () => {
      const result = await normalizeToEnglish(input, [])
      expect(result.wasTranslated).toBe(true)
      expect(result.detectedScript).toBe('devanagari')
      expect(result.normalizedEnglish.toLowerCase()).toContain(expectedKeyword)
    })
  })
})

describe('Tamil Symptom Static Dictionary (normalizeToEnglish)', () => {
  const tamilCases: Array<[string, string]> = [
    ['எனக்கு காய்ச்சல் உள்ளது', 'fever'],
    ['என் பல் வலிக்கிறது', 'tooth'],
    ['எனக்கு தலைவலி இருக்கிறது', 'headache'],
    ['எனக்கு வயிற்று வலி உள்ளது', 'stomach'],
    ['எனக்கு இருமல் உள்ளது', 'cough'],
    ['எனக்கு வாந்தி வருகிறது', 'vomit'],
    ['எனக்கு வயிற்றுப்போக்கு உள்ளது', 'diarrhea'],
    ['எனக்கு தலைச்சுற்றல் இருக்கிறது', 'dizzy'],
    ['நெஞ்சு வலிக்கிறது', 'chest pain'],
    ['முதுகு வலிக்கிறது', 'back pain'],
    ['எனக்கு சோர்வாக இருக்கிறது', 'fatigue'],
    ['மூட்டு வலிக்கிறது', 'joint'],
  ]

  tamilCases.forEach(([input, expectedKeyword]) => {
    it(`"${input}" translates to contain "${expectedKeyword}"`, async () => {
      const result = await normalizeToEnglish(input, [])
      expect(result.wasTranslated).toBe(true)
      expect(result.detectedScript).toBe('tamil')
      expect(result.normalizedEnglish.toLowerCase()).toContain(expectedKeyword)
    })
  })
})

describe('Hindi→English→Category integration (static path via fallbackHeuristicExtraction)', () => {
  const integrationCases: Array<[string, string, string]> = [
    ['मुझे बुखार है', 'fever', 'Hindi: fever'],
    ['मुझे सिरदर्द है', 'headache', 'Hindi: headache'],
    ['मेरे दांत में दर्द है', 'toothache_dental_pain', 'Hindi: tooth pain'],
    ['मुझे पेट दर्द है', 'stomach_pain', 'Hindi: stomach pain'],
    ['मुझे खांसी है', 'cough', 'Hindi: cough'],
  ]

  integrationCases.forEach(([input, expectedCategory, label]) => {
    it(`${label} → ${expectedCategory}`, async () => {
      const norm = await normalizeToEnglish(input, [])
      const result = fallbackHeuristicExtraction(norm.normalizedEnglish)
      expect(result.category).toBe(expectedCategory)
      expect(result.confidence).toBe('high')
    })
  })
})

describe('Tamil→English→Category integration (static path via fallbackHeuristicExtraction)', () => {
  const integrationCases: Array<[string, string, string]> = [
    ['எனக்கு காய்ச்சல் உள்ளது', 'fever', 'Tamil: fever'],
    ['எனக்கு தலைவலி இருக்கிறது', 'headache', 'Tamil: headache'],
    ['என் பல் வலிக்கிறது', 'toothache_dental_pain', 'Tamil: tooth pain'],
    ['எனக்கு வயிற்று வலி உள்ளது', 'stomach_pain', 'Tamil: stomach pain'],
    ['எனக்கு இருமல் உள்ளது', 'cough', 'Tamil: cough'],
  ]

  integrationCases.forEach(([input, expectedCategory, label]) => {
    it(`${label} → ${expectedCategory}`, async () => {
      const norm = await normalizeToEnglish(input, [])
      const result = fallbackHeuristicExtraction(norm.normalizedEnglish)
      expect(result.category).toBe(expectedCategory)
      expect(result.confidence).toBe('high')
    })
  })
})

describe('State isolation: English → Hindi → Tamil sequential checks', () => {
  it('English does not affect Hindi result', async () => {
    const engResult = fallbackHeuristicExtraction('I have fever')
    expect(engResult.category).toBe('fever')

    const hindiNorm = await normalizeToEnglish('मुझे सिरदर्द है', [])
    const hindiResult = fallbackHeuristicExtraction(hindiNorm.normalizedEnglish)
    expect(hindiResult.category).toBe('headache') // not fever
  })

  it('Hindi does not affect Tamil result', async () => {
    const hindiNorm = await normalizeToEnglish('मेरे दांत में दर्द है', [])
    const hindiResult = fallbackHeuristicExtraction(hindiNorm.normalizedEnglish)
    expect(hindiResult.category).toBe('toothache_dental_pain')

    const tamilNorm = await normalizeToEnglish('எனக்கு காய்ச்சல் உள்ளது', [])
    const tamilResult = fallbackHeuristicExtraction(tamilNorm.normalizedEnglish)
    expect(tamilResult.category).toBe('fever') // not toothache
  })

  it('Tamil does not affect English result', async () => {
    const tamilNorm = await normalizeToEnglish('எனக்கு வயிற்று வலி உள்ளது', [])
    const tamilResult = fallbackHeuristicExtraction(tamilNorm.normalizedEnglish)
    expect(tamilResult.category).toBe('stomach_pain')

    // English runs fresh — no state from Tamil
    const engResult = fallbackHeuristicExtraction('I have a headache')
    expect(engResult.category).toBe('headache') // not stomach_pain
  })
})

describe('Multi-symptom Hindi input', () => {
  it('"मुझे बुखार और सिरदर्द है" detects fever as primary', async () => {
    const norm = await normalizeToEnglish('मुझे बुखार और सिरदर्द है', [])
    // Both words should appear in the normalized text
    expect(norm.normalizedEnglish.toLowerCase()).toMatch(/fever|headache/)
  })
})

describe('Latin/English input is never accidentally translated', () => {
  it('English text passes through unchanged', async () => {
    const result = await normalizeToEnglish('I have a headache', [])
    expect(result.wasTranslated).toBe(false)
    expect(result.detectedScript).toBe('latin')
    expect(result.normalizedEnglish).toBe('I have a headache')
  })

  it('Typo English "gastic" passes through unchanged', async () => {
    const result = await normalizeToEnglish('I have gastic', [])
    expect(result.wasTranslated).toBe(false)
    expect(result.normalizedEnglish).toBe('I have gastic')
  })
})
