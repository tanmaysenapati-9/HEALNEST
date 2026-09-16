import { describe, it, expect } from 'vitest'
import { runEngine } from './pathwayEngine'
import { getQuestionsForCategory } from './questionLibrary'
import { getCarePathwayTemplate } from './carePathways'
import type { StructuredContext } from './types'

describe('HEALNEST Rule Engine (Part 2)', () => {
  // ==========================================================================
  // 1. Incomplete context & next question progression
  // ==========================================================================
  describe('Context stepping & question progression', () => {
    it('returns the first question when answers are empty without throwing', () => {
      const context: StructuredContext = {
        category: 'burn',
        answers: {},
      }
      const result = runEngine(context)
      expect(result.outcome).toBe('monitor')
      expect(result.nextQuestionId).toBe('burn_cause')
      expect(result.confidence).toBe('low')
      expect(result.triggeredRedFlags).toEqual([])
    })

    it('returns the next unanswered question in sequence', () => {
      const context: StructuredContext = {
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
        },
      }
      const result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_location')
    })

    it('handles all 3 categories when starting with empty answers', () => {
      const categories = ['burn', 'stomach_pain', 'headache'] as const
      for (const cat of categories) {
        const result = runEngine({ category: cat, answers: {} })
        const firstQuestion = getQuestionsForCategory(cat)[0]
        expect(result.nextQuestionId).toBe(firstQuestion.id)
      }
    })
  })

  // ==========================================================================
  // 2. Red Flag Short-Circuiting (Mid-Questionnaire & Full)
  // ==========================================================================
  describe('Red flag evaluation & immediate short-circuiting', () => {
    // Burn Red Flags
    it('burn: triggers urgent immediately on chemical cause with no other questions answered', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'chemical',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_chemical_or_electrical')
      expect(result.nextQuestionId).toBeNull()
      expect(result.confidence).toBe('high')
    })

    it('burn: triggers urgent immediately on electricity cause', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'electricity',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_chemical_or_electrical')
      expect(result.nextQuestionId).toBeNull()
    })

    it('burn: triggers urgent on breathing difficulty or smoke inhalation', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'fire_flame',
          burn_breathing: 'yes',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_airway_compromise')
      expect(result.nextQuestionId).toBeNull()
    })

    it('burn: triggers urgent on critical anatomical location (face/hands/genitals/joints)', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'yes',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_critical_location')
    })

    it('burn: triggers urgent on full-thickness charred or white/blackened skin', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_object',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'smaller_than_palm',
          burn_skin: 'white_blackened',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_full_thickness')
    })

    it('burn: triggers urgent on large blistered burn exceeding palm size', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'larger_than_palm',
          burn_skin: 'blistered',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_extensive_partial_thickness')
    })

    // Stomach Pain Red Flags
    it('stomach: triggers urgent immediately on direct red-flag question (rigid abdomen/vomiting blood)', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'yes',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('stomach_peritonism_or_hematemesis')
      expect(result.nextQuestionId).toBeNull()
    })

    it('stomach: triggers urgent on severe pain with blood in stool', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: 'less_6h',
          stomach_severity: 'severe',
          stomach_location: 'lower',
          stomach_associated: ['blood_in_stool'],
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('stomach_severe_with_gi_bleeding')
    })

    it('stomach: triggers urgent on acute severe whole-abdomen pain', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: 'less_6h',
          stomach_severity: 'severe',
          stomach_location: 'whole',
          stomach_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('stomach_severe_acute_whole_abdomen')
    })

    // Headache Red Flags
    it('headache: triggers urgent immediately on direct red flags answered yes', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'yes',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_direct_red_flags')
      expect(result.nextQuestionId).toBeNull()
    })

    it('headache: triggers urgent on thunderclap onset with severe headache', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'sudden',
          headache_severity: 'severe',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_thunderclap_onset')
    })

    it('headache: triggers urgent on worst headache of life', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'worst_ever',
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_worst_headache_of_life')
    })

    it('headache: triggers urgent on stiff neck with fever', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'moderate',
          headache_associated: ['stiff_neck_fever'],
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_meningismus_or_neurological_deficit')
    })

    it('headache: triggers urgent on confusion or weakness', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'moderate',
          headache_associated: ['confusion_weakness'],
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_meningismus_or_neurological_deficit')
    })

    it('headache: triggers urgent on acute vision loss', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'moderate',
          headache_associated: ['vision_loss'],
        },
      })
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_meningismus_or_neurological_deficit')
    })
  })

  // ==========================================================================
  // 3. Clean / Mild Answer Paths resolving to 'self_care'
  // ==========================================================================
  describe('Clean/mild pathways resolving to self_care', () => {
    it('burn: small superficial burn resolves to self_care with high confidence', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'smaller_than_palm',
          burn_skin: 'normal_red',
        },
      })
      expect(result.outcome).toBe('self_care')
      expect(result.confidence).toBe('high')
      expect(result.nextQuestionId).toBeNull()
      expect(result.triggeredRedFlags).toEqual([])
    })

    it('stomach: mild pain of short duration without fever/vomiting resolves to self_care', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: 'less_6h',
          stomach_severity: 'mild',
          stomach_location: 'upper',
          stomach_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('self_care')
      expect(result.confidence).toBe('high')
      expect(result.nextQuestionId).toBeNull()
    })

    it('headache: mild gradual headache with no neuro features resolves to self_care', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'mild',
          headache_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('self_care')
      expect(result.confidence).toBe('high')
      expect(result.nextQuestionId).toBeNull()
    })
  })

  // ==========================================================================
  // 4. Borderline / Ambiguous paths resolving to 'see_doctor'
  // ==========================================================================
  describe('Borderline or clinically complicated paths resolving to see_doctor', () => {
    it('burn: blistered burn smaller than palm resolves to see_doctor', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_object',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'smaller_than_palm',
          burn_skin: 'blistered',
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.confidence).toBe('high')
    })

    it('burn: palm-sized red burn resolves to see_doctor', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'about_palm_size',
          burn_skin: 'normal_red',
        },
      })
      expect(result.outcome).toBe('see_doctor')
    })

    it('stomach: pain lasting longer than 3 days resolves to see_doctor', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: 'longer_3_days',
          stomach_severity: 'mild',
          stomach_location: 'lower',
          stomach_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.confidence).toBe('high')
    })

    it('stomach: mild pain accompanied by fever resolves to see_doctor', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: '1_day',
          stomach_severity: 'mild',
          stomach_location: 'upper',
          stomach_associated: ['fever'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.confidence).toBe('high')
    })

    it('headache: severe headache (non-thunderclap) resolves to see_doctor', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'severe',
          headache_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.confidence).toBe('high')
    })
  })

  // ==========================================================================
  // 5. 'not_sure' handling on critical questions
  // ==========================================================================
  describe('Not sure safety escalation (Never resolves to self_care)', () => {
    it('burn: "not_sure" on skin appearance escalates to see_doctor', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'smaller_than_palm',
          burn_skin: 'not_sure',
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
      expect(result.reason).toContain('Uncertainty')
    })

    it('burn: "not_sure" on burn size escalates to see_doctor', () => {
      const result = runEngine({
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'not_sure',
          burn_skin: 'normal_red',
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
    })

    it('stomach: "not_sure" on stomach_red_flags escalates to see_doctor', () => {
      const result = runEngine({
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'not_sure',
          stomach_duration: 'less_6h',
          stomach_severity: 'mild',
          stomach_location: 'upper',
          stomach_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
    })

    it('headache: "not_sure" on headache_onset escalates to see_doctor', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'not_sure',
          headache_severity: 'mild',
          headache_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
    })

    it('headache: "not_sure" on headache_red_flags escalates to see_doctor', () => {
      const result = runEngine({
        category: 'headache',
        answers: {
          headache_red_flags: 'not_sure',
          headache_onset: 'gradual',
          headache_severity: 'mild',
          headache_associated: ['none'],
        },
      })
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
    })
  })

  // ==========================================================================
  // 6. Care Pathway Templates Integrity
  // ==========================================================================
  describe('Care Pathways Templates', () => {
    const outcomes = ['self_care', 'monitor', 'see_doctor', 'urgent'] as const

    it('provides structured templates with non-empty actionable sections for all outcomes', () => {
      for (const outcome of outcomes) {
        const template = getCarePathwayTemplate(outcome)
        expect(template.outcome).toBe(outcome)
        expect(template.label).toBeTruthy()
        expect(template.whatToDoNow.length).toBeGreaterThan(0)
        expect(template.whatToMonitor.length).toBeGreaterThan(0)
        expect(template.whenToSeekImmediateCare.length).toBeGreaterThan(0)
      }
    })

    it('provides category-specific guidance overrides for burns', () => {
      const burnSelfCare = getCarePathwayTemplate('self_care', 'burn')
      expect(burnSelfCare.whatToDoNow.some((item) => item.includes('water'))).toBe(true)
    })
  })
})
