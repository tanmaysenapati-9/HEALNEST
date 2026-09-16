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
