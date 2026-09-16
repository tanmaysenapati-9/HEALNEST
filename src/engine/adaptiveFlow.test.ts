import { describe, it, expect } from 'vitest'
import { runEngine } from './pathwayEngine'
import { getQuestionsForCategory, QUESTION_LIBRARY } from './questionLibrary'
import type { StructuredContext } from './types'

describe('HEALNEST Adaptive Question Flow & Engine Integration (Part 4)', () => {
  // ==========================================================================
  // 1. "Why are you asking this?" metadata audit
  // ==========================================================================
  describe('Question whyText presence', () => {
    it('ensures every single question across all 3 pathways has a static clinical whyText explanation', () => {
      const categories = ['burn', 'stomach_pain', 'headache'] as const
      for (const cat of categories) {
        const questions = getQuestionsForCategory(cat)
        expect(questions.length).toBeGreaterThan(0)
        for (const q of questions) {
          expect(q.whyText).toBeDefined()
          expect(q.whyText!.length).toBeGreaterThan(15)
        }
      }
    })
  })

  // ==========================================================================
  // 2. Burn Pathway End-to-End Tracing & Red-Flag Interruption
  // ==========================================================================
  describe('Burn pathway adaptive progression', () => {
    it('Burn Red-Flag Interruption: selecting location=yes immediately triggers urgent outcome without needing remaining questions', () => {
      const context: StructuredContext = {
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'yes', // Red flag trigger!
          // Note: burn_size and burn_skin are NOT answered yet
        },
      }

      const result = runEngine(context)
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('burn_critical_location')
      // Engine immediately signals completion/interruption (nextQuestionId is null)
      expect(result.nextQuestionId).toBeNull()
    })

    it('Burn Clean Mild Path: walks through all questions and terminates with self_care outcome', () => {
      // Step 1: initial state
      let context: StructuredContext = { category: 'burn', answers: {} }
      let result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_cause')

      // Step 2: answer cause
      context = { ...context, answers: { ...context.answers, burn_cause: 'hot_liquid' } }
      result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_breathing')

      // Step 3: answer breathing
      context = { ...context, answers: { ...context.answers, burn_breathing: 'no' } }
      result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_location')

      // Step 4: answer location
      context = { ...context, answers: { ...context.answers, burn_location: 'no' } }
      result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_size')

      // Step 5: answer size
      context = { ...context, answers: { ...context.answers, burn_size: 'smaller_than_palm' } }
      result = runEngine(context)
      expect(result.nextQuestionId).toBe('burn_skin')

      // Step 6: answer skin
      context = { ...context, answers: { ...context.answers, burn_skin: 'normal_red' } }
      result = runEngine(context)

      // Finished!
      expect(result.nextQuestionId).toBeNull()
      expect(result.outcome).toBe('self_care')
      expect(result.confidence).toBe('high')
    })

    it('Burn Critical "Not sure" Handling: answering not_sure on burn_skin never defaults to self_care', () => {
      const context: StructuredContext = {
        category: 'burn',
        answers: {
          burn_cause: 'hot_liquid',
          burn_breathing: 'no',
          burn_location: 'no',
          burn_size: 'smaller_than_palm',
          burn_skin: 'not_sure',
        },
      }

      const result = runEngine(context)
      expect(result.nextQuestionId).toBeNull()
      expect(result.outcome).toBe('see_doctor')
      expect(result.outcome).not.toBe('self_care')
    })
  })

  // ==========================================================================
  // 3. Stomach Pain Pathway End-to-End Tracing
  // ==========================================================================
  describe('Stomach pain pathway adaptive progression', () => {
    it('Stomach Red-Flag Interruption: answering stomach_red_flags=yes immediately stops questionnaire', () => {
      const context: StructuredContext = {
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'yes',
        },
      }

      const result = runEngine(context)
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('stomach_peritonism_or_hematemesis')
      expect(result.nextQuestionId).toBeNull()
    })

    it('Stomach Clean Mild Path: mild short-duration pain with no complications completes to self_care', () => {
      const context: StructuredContext = {
        category: 'stomach_pain',
        answers: {
          stomach_red_flags: 'no',
          stomach_duration: 'less_6h',
          stomach_severity: 'mild',
          stomach_location: 'upper',
          stomach_associated: ['none'],
        },
      }

      const result = runEngine(context)
      expect(result.nextQuestionId).toBeNull()
      expect(result.outcome).toBe('self_care')
    })
  })

  // ==========================================================================
  // 4. Headache Pathway End-to-End Tracing
  // ==========================================================================
  describe('Headache pathway adaptive progression', () => {
    it('Headache Red-Flag Interruption: sudden onset + severe headache immediately triggers urgent', () => {
      const context: StructuredContext = {
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'sudden',
          headache_severity: 'severe',
        },
      }

      const result = runEngine(context)
      expect(result.outcome).toBe('urgent')
      expect(result.triggeredRedFlags).toContain('headache_thunderclap_onset')
      expect(result.nextQuestionId).toBeNull()
    })

    it('Headache Clean Mild Path: gradual mild headache without neuro flags completes to self_care', () => {
      const context: StructuredContext = {
        category: 'headache',
        answers: {
          headache_red_flags: 'no',
          headache_onset: 'gradual',
          headache_severity: 'mild',
          headache_associated: ['none'],
        },
      }

      const result = runEngine(context)
      expect(result.nextQuestionId).toBeNull()
      expect(result.outcome).toBe('self_care')
    })
  })
})
