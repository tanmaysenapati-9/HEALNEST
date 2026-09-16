/**
 * HEALNEST Rule Engine — Shared Type Definitions
 *
 * SAFETY CONSTRAINT:
 * Deterministic types for standalone clinical triage logic.
 * Zero external AI/LLM dependencies.
 */

export type SymptomCategory = 
  | 'burn'
  | 'stomach_pain'
  | 'headache'
  | 'fever'
  | 'cough'
  | 'rash'
  | 'chest_pain'
  | 'back_pain'
  | 'dizziness'
  | 'allergic_reaction'
  | 'fatigue'
  | 'unexplained_weight_loss'
  | 'cuts'
  | 'nausea_vomiting'
  | 'diarrhea'
  | 'constipation'
  | 'blood_in_stool'
  | 'numbness_weakness'
  | 'confusion'
  | 'seizure'
  | 'fainting'
  | 'joint_pain'
  | 'muscle_strain'
  | 'insect_bite'
  | 'eye_problem'
  | 'ear_pain'
  | 'urinary_symptoms'
  | 'mental_health_concern'
  | 'toothache_dental_pain'

export type AssessmentOutcome = 'self_care' | 'monitor' | 'see_doctor' | 'urgent'

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface Option {
  id: string
  label: string
  value: string
  redFlag?: boolean
}

export interface Question {
  id: string
  category: SymptomCategory
  text: string
  subtext?: string
  whyText?: string
  options: Option[]
  multiSelect?: boolean
  isRedFlagTrigger?: boolean
  isCriticalForOutcome?: boolean
  appliesWhen?: (answers: Record<string, string | string[] | 'not_sure'>) => boolean
}

export interface StructuredContext {
  category: SymptomCategory
  answers: Record<string, string | string[] | 'not_sure'>
  freeTextDescription?: string
}

export interface AssessmentResult {
  outcome: AssessmentOutcome
  reason: string
  triggeredRedFlags: string[]
  confidence: ConfidenceLevel
  nextQuestionId: string | null
}

export interface RedFlagRule {
  id: string
  category: SymptomCategory
  condition: (answers: Record<string, string | string[] | 'not_sure'>) => boolean
  resultOutcome: 'urgent'
  reasonText: string
}

export interface CarePathwayTemplate {
  outcome: AssessmentOutcome
  label: string
  whatToDoNow: string[]
  whatToMonitor: string[]
  whenToSeekImmediateCare: string[]
}
