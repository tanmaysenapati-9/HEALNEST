
/**
 * SAFETY REQUIREMENT (NON-NEGOTIABLE):
 * For symptoms suggesting a classic medical emergency (chest pain radiating with sweating,
 * stroke signs, anaphylaxis, active seizure, severe bleeding, confusion with fever, etc.),
 * the rule engine must default to urgent, not rely on AI judgment.
 * The AI only rewrites wording of an outcome already decided — it must never be given
 * authority to change the triage level itself.
 */

import type {
  AssessmentOutcome,
  AssessmentResult,
  StructuredContext,
  SymptomCategory,
} from './types'
import { getQuestionsForCategory } from './questionLibrary'
import { evaluateRedFlags } from './redFlags'

/**
 * Helper to safely check answer values
 */
function getAnswer(
  answers: Record<string, string | string[] | 'not_sure'>,
  questionId: string
): string | string[] | 'not_sure' | undefined {
  return answers[questionId]
}

function hasValue(
  answers: Record<string, string | string[] | 'not_sure'>,
  questionId: string,
  target: string
): boolean {
  const ans = answers[questionId]
  if (!ans) return false
  if (Array.isArray(ans)) {
    return ans.includes(target)
  }
  return ans === target
}

function isNotSure(
  answers: Record<string, string | string[] | 'not_sure'>,
  questionId: string
): boolean {
  const ans = answers[questionId]
  if (ans === 'not_sure') return true
  if (Array.isArray(ans) && ans.includes('not_sure')) return true
  return false
}

/**
 * ============================================================================
 * PATHWAY EVALUATORS (Deterministic Decision Tables)
 * ============================================================================
 */

function evaluateBurnPathway(
  answers: Record<string, string | string[] | 'not_sure'>
): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  // Check critical uncertainty
  const criticalKeys = ['burn_cause', 'burn_skin', 'burn_size', 'burn_location', 'burn_breathing']
  for (const key of criticalKeys) {
    if (isNotSure(answers, key)) {
      return {
        outcome: 'see_doctor',
        reason:
          'Uncertainty regarding burn depth, location, or area: clinical evaluation is recommended to safely assess tissue viability and prevent complications.',
        confidence: 'medium',
      }
    }
  }

  const skin = getAnswer(answers, 'burn_skin')
  const size = getAnswer(answers, 'burn_size')
  const location = getAnswer(answers, 'burn_location')
  const breathing = getAnswer(answers, 'burn_breathing')

  // Clean superficial mild burn
  if (
    size === 'smaller_than_palm' &&
    skin === 'normal_red' &&
    location === 'no' &&
    breathing === 'no'
  ) {
    return {
      outcome: 'self_care',
      reason:
        'Minor superficial (first-degree) burn smaller than palm size with intact red skin and no sensitive anatomical regions affected.',
      confidence: 'high',
    }
  }

  // Blistered or damaged skin
  if (skin === 'blistered' || skin === 'peeling_damaged') {
    return {
      outcome: 'see_doctor',
      reason:
        'Partial-thickness burn with blistering or damaged skin requires clinical evaluation for sterile dressing and infection prophylaxis.',
      confidence: 'high',
    }
  }

  // Moderate size burn
  if (size === 'about_palm_size' || size === 'larger_than_palm') {
    return {
      outcome: 'see_doctor',
      reason:
        'Burn area equal to or exceeding palm size warrants medical evaluation to manage fluid balance and wound healing.',
      confidence: 'high',
    }
  }

  return {
    outcome: 'see_doctor',
    reason: 'Clinical assessment recommended for comprehensive burn staging and wound care.',
    confidence: 'medium',
  }
}

function evaluateStomachPainPathway(
  answers: Record<string, string | string[] | 'not_sure'>
): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  // Check critical uncertainty
  const criticalKeys = ['stomach_red_flags', 'stomach_duration', 'stomach_severity', 'stomach_associated']
  for (const key of criticalKeys) {
    if (isNotSure(answers, key)) {
      return {
        outcome: 'see_doctor',
        reason:
          'Uncertainty regarding abdominal symptoms or severity: a medical examination is advised when abdominal conditions cannot be verified at home.',
        confidence: 'medium',
      }
    }
  }

  const duration = getAnswer(answers, 'stomach_duration')
  const severity = getAnswer(answers, 'stomach_severity')

  const hasComplications =
    hasValue(answers, 'stomach_associated', 'fever') ||
    hasValue(answers, 'stomach_associated', 'vomiting') ||
    hasValue(answers, 'stomach_associated', 'no_fluids')

  // Persistent pain > 3 days or complications
  if (duration === 'longer_3_days' || hasComplications) {
    return {
      outcome: 'see_doctor',
      reason:
        'Abdominal pain persisting beyond 3 days or accompanied by systemic symptoms (fever, persistent vomiting, dehydration risk) requires clinical diagnosis.',
      confidence: 'high',
    }
  }

  // Moderate pain
  if (severity === 'moderate') {
    if (duration === '2_3_days') {
      return {
        outcome: 'see_doctor',
        reason:
          'Moderate abdominal discomfort persisting for multiple days warrants outpatient medical evaluation.',
        confidence: 'high',
      }
    }
    return {
      outcome: 'monitor',
      reason:
        'Moderate acute discomfort without alarm features. Monitor symptom trajectory over the next 12 to 24 hours with conservative hydration.',
      confidence: 'medium',
    }
  }

  // Mild pain
  if (severity === 'mild') {
    if (duration === '2_3_days') {
      return {
        outcome: 'monitor',
        reason:
          'Mild abdominal symptoms persisting for 2-3 days. Continue dietary moderation and active monitoring; consult doctor if unresolved after 72 hours.',
        confidence: 'high',
      }
    }

    return {
      outcome: 'self_care',
      reason:
        'Mild, short-duration abdominal discomfort with no fever, vomiting, or red-flag signs. Manageable with rest, clear fluids, and bland diet.',
      confidence: 'high',
    }
  }

  return {
    outcome: 'see_doctor',
    reason: 'Clinical assessment recommended for undifferentiated abdominal pain.',
    confidence: 'medium',
  }
}

function evaluateHeadachePathway(
  answers: Record<string, string | string[] | 'not_sure'>
): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  // Check critical uncertainty
  const criticalKeys = ['headache_red_flags', 'headache_onset', 'headache_severity', 'headache_associated']
  for (const key of criticalKeys) {
    if (isNotSure(answers, key)) {
      return {
        outcome: 'see_doctor',
        reason:
          'Uncertainty regarding headache onset or neurological features: medical evaluation is recommended to safely assess etiology.',
        confidence: 'medium',
      }
    }
  }

  const onset = getAnswer(answers, 'headache_onset')
  const severity = getAnswer(answers, 'headache_severity')
  const hasSensory = hasValue(answers, 'headache_associated', 'light_sound_sensitivity')

  // Severe headache
  if (severity === 'severe') {
    return {
      outcome: 'see_doctor',
      reason:
        'Severe, debilitating headache warrants medical consultation to determine diagnosis and initiate tailored acute therapy.',
      confidence: 'high',
    }
  }

  // Moderate headache
  if (severity === 'moderate') {
    if (hasSensory) {
      return {
        outcome: 'monitor',
        reason:
          'Moderate headache with sensory sensitivity consistent with migraine. Rest in a dark, quiet room and monitor response to rest and hydration.',
        confidence: 'high',
      }
    }
    return {
      outcome: 'monitor',
      reason:
        'Moderate headache without neurological deficits. Active observation, hydration, and rest advised.',
      confidence: 'medium',
    }
  }

  // Mild gradual headache
  if (severity === 'mild' && onset === 'gradual') {
    return {
      outcome: 'self_care',
      reason:
        'Mild gradual-onset headache with no neurological red flags, characteristic of common tension or mild dehydration headache.',
      confidence: 'high',
    }
  }

  return {
    outcome: 'see_doctor',
    reason: 'Clinical evaluation advised for uncharacterized headache symptoms.',
    confidence: 'medium',
  }
}

/**
 * ============================================================================
 * CORE ENGINE EXECUTION FUNCTION
 * ============================================================================
 *
 * Deterministic rule-based triage assessment.
 * Zero AI/LLM calls.
 *
 * Steps:
 * 1. Evaluate Red Flags immediately on every call -> if matched, return 'urgent'.
 * 2. If not urgent, check for the next unanswered applicable question.
 * 3. If all applicable questions answered, execute deterministic decision table.
 * 4. Critical "not_sure" answers escalate safely to 'see_doctor'.
 */

function evaluateFeverPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  if (isNotSure(answers, 'fever_temperature') || isNotSure(answers, 'fever_duration')) {
    return { outcome: 'see_doctor', reason: 'Uncertainty regarding temperature or duration requires clinical evaluation.', confidence: 'medium' }
  }
  const temp = getAnswer(answers, 'fever_temperature')
  const duration = getAnswer(answers, 'fever_duration')
  const status = getAnswer(answers, 'fever_status')

  if (status === 'yes') {
    return { outcome: 'see_doctor', reason: 'Fever in a vulnerable or immunocompromised patient requires prompt medical evaluation.', confidence: 'high' }
  }
  if (temp === 'moderate' || duration === 'more_5_days') {
    return { outcome: 'see_doctor', reason: 'Moderate fever or fever lasting more than 5 days warrants clinical investigation.', confidence: 'high' }
  }
  return { outcome: 'self_care', reason: 'Low-grade, short-duration fever without red flags is typically self-limiting and can be managed with rest and hydration.', confidence: 'high' }
}

function evaluateCoughPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  if (isNotSure(answers, 'cough_duration')) {
    return { outcome: 'see_doctor', reason: 'Uncertain duration of cough requires clinical assessment.', confidence: 'medium' }
  }
  const duration = getAnswer(answers, 'cough_duration')
  const sputum = getAnswer(answers, 'cough_sputum')

  if (sputum === 'discolored' || duration === 'more_8_weeks') {
    return { outcome: 'see_doctor', reason: 'Chronic cough or purulent sputum indicates possible infection or underlying pulmonary issue requiring medical evaluation.', confidence: 'high' }
  }
  if (duration === '3_to_8_weeks') {
    return { outcome: 'monitor', reason: 'Subacute cough should be monitored for improvement or worsening.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Acute cough with clear sputum is likely viral and can be managed with supportive care.', confidence: 'high' }
}

function evaluateRashPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const appearance = getAnswer(answers, 'rash_appearance')
  if (appearance === 'blistering') {
    return { outcome: 'see_doctor', reason: 'Blistering or painful rashes require clinical diagnosis and targeted treatment.', confidence: 'high' }
  }
  if (appearance === 'red_bumpy') {
    return { outcome: 'monitor', reason: 'Hives or welts without systemic symptoms can often be monitored and treated with antihistamines.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Mild, localized dry or patchy rashes can typically be managed with over-the-counter emollients.', confidence: 'medium' }
}

function evaluateChestPainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const character = getAnswer(answers, 'chest_pain_character')
  if (character === 'sharp' || character === 'burning') {
    return { outcome: 'see_doctor', reason: 'Non-crushing chest pain still warrants clinical evaluation to rule out pulmonary or gastrointestinal issues.', confidence: 'high' }
  }
  return { outcome: 'see_doctor', reason: 'Any uncharacterized chest pain requires medical evaluation.', confidence: 'medium' }
}

function evaluateBackPainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const cause = getAnswer(answers, 'back_pain_cause')
  const assoc = getAnswer(answers, 'back_pain_associated')

  if (assoc === 'yes') {
    return { outcome: 'see_doctor', reason: 'Back pain with fever or weight loss requires investigation for infection or malignancy.', confidence: 'high' }
  }
  if (cause === 'minor_strain') {
    return { outcome: 'self_care', reason: 'Back pain following a minor strain can usually be managed with rest, ice/heat, and over-the-counter analgesics.', confidence: 'high' }
  }
  return { outcome: 'monitor', reason: 'Uncomplicated back pain can be monitored for improvement with conservative measures.', confidence: 'medium' }
}

function evaluateDizzinessPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const type = getAnswer(answers, 'dizziness_type')
  if (type === 'spinning') {
    return { outcome: 'see_doctor', reason: 'Vertigo (spinning sensation) requires clinical assessment to determine inner ear vs central cause.', confidence: 'high' }
  }
  if (type === 'faint') {
    return { outcome: 'see_doctor', reason: 'Feeling faint requires medical evaluation to check for orthostatic hypotension or arrhythmias.', confidence: 'high' }
  }
  return { outcome: 'monitor', reason: 'Mild unsteadiness should be monitored carefully in a safe environment.', confidence: 'medium' }
}

function evaluateCutsPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const depth = getAnswer(answers, 'cuts_depth')
  const inf = getAnswer(answers, 'cuts_signs_of_infection')

  if (inf === 'yes') {
    return { outcome: 'see_doctor', reason: 'Signs of infection in a cut require medical evaluation for antibiotics.', confidence: 'high' }
  }
  if (depth === 'deep') {
    return { outcome: 'see_doctor', reason: 'Deep cuts exposing fat or muscle require clinical evaluation for potential sutures or wound closure.', confidence: 'high' }
  }
  return { outcome: 'self_care', reason: 'Superficial cuts with controlled bleeding can be managed with thorough cleaning and sterile dressing at home.', confidence: 'high' }
}

function evaluateAllergicReactionPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const history = getAnswer(answers, 'allergy_history')
  const rash = getAnswer(answers, 'allergy_rash')

  if (history === 'yes' || rash === 'rapid') {
    return { outcome: 'see_doctor', reason: 'History of severe allergies or rapidly spreading rash warrants immediate clinical observation.', confidence: 'high' }
  }
  return { outcome: 'monitor', reason: 'Mild localized allergic reactions can be monitored and managed with antihistamines.', confidence: 'medium' }
}



function evaluateFatiguePathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const duration = getAnswer(answers, 'fatigue_duration')
  const impact = getAnswer(answers, 'fatigue_impact')
  const assoc = getAnswer(answers, 'fatigue_associated')

  if (assoc === 'fever_night_sweats' || impact === 'severe') {
    return { outcome: 'see_doctor', reason: 'Severe fatigue or fatigue with fever/night sweats requires clinical evaluation.', confidence: 'high' }
  }
  if (duration === 'months') {
    return { outcome: 'see_doctor', reason: 'Chronic fatigue lasting over 6 months warrants investigation for chronic conditions.', confidence: 'medium' }
  }
  if (duration === 'weeks' || assoc === 'depression') {
    return { outcome: 'monitor', reason: 'Fatigue lasting weeks should be monitored; consider lifestyle or mood factors.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Short-term fatigue is often related to temporary stress, lack of sleep, or minor viral illnesses.', confidence: 'high' }
}

function evaluateUnexplainedWeightLossPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const amount = getAnswer(answers, 'weight_loss_amount')
  const duration = getAnswer(answers, 'weight_loss_duration')
  const assoc = getAnswer(answers, 'weight_loss_associated')

  if (amount === 'moderate' || duration === 'rapid' || assoc === 'excess_thirst') {
    return { outcome: 'see_doctor', reason: 'Unexplained weight loss of 5-10 lbs, rapid loss, or accompanying thirst requires clinical check (e.g., thyroid, diabetes).', confidence: 'high' }
  }
  if (amount === 'small') {
    return { outcome: 'monitor', reason: 'Small weight fluctuations can be normal, but monitor for progressive loss.', confidence: 'medium' }
  }
  return { outcome: 'see_doctor', reason: 'Unexplained weight loss generally requires a non-urgent medical evaluation.', confidence: 'low' }
}


function evaluateNauseaVomitingPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const duration = getAnswer(answers, 'nv_duration')
  const assoc = getAnswer(answers, 'nv_associated')

  if (assoc === 'fever') {
    return { outcome: 'see_doctor', reason: 'Vomiting with a high fever requires medical evaluation.', confidence: 'high' }
  }
  if (duration === 'more_2_days') {
    return { outcome: 'see_doctor', reason: 'Vomiting lasting more than 2 days increases dehydration risk significantly.', confidence: 'high' }
  }
  if (duration === '1_to_2_days') {
    return { outcome: 'monitor', reason: 'Monitor closely for signs of dehydration.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Acute vomiting can often be managed with rest and gradual oral rehydration.', confidence: 'high' }
}

function evaluateDiarrheaPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const duration = getAnswer(answers, 'diarrhea_duration')
  
  if (duration === 'more_5_days') {
    return { outcome: 'see_doctor', reason: 'Diarrhea lasting more than 5 days requires medical evaluation.', confidence: 'high' }
  }
  if (duration === '3_to_5_days') {
    return { outcome: 'monitor', reason: 'Monitor hydration and symptoms closely.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Acute diarrhea can usually be managed with rest and oral rehydration solutions.', confidence: 'high' }
}

function evaluateConstipationPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const duration = getAnswer(answers, 'constipation_duration')
  
  if (duration === 'more_week') {
    return { outcome: 'see_doctor', reason: 'Severe constipation lasting over a week requires medical evaluation for impaction.', confidence: 'high' }
  }
  if (duration === 'one_week') {
    return { outcome: 'monitor', reason: 'Monitor symptoms and try conservative management.', confidence: 'medium' }
  }
  return { outcome: 'self_care', reason: 'Mild constipation can often be managed with increased fluids, fiber, and exercise.', confidence: 'high' }
}

function evaluateBloodInStoolPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const amount = getAnswer(answers, 'blood_stool_amount')
  
  if (amount === 'moderate') {
    return { outcome: 'see_doctor', reason: 'Noticeable blood in the stool requires clinical evaluation.', confidence: 'high' }
  }
  if (amount === 'streaks') {
    return { outcome: 'see_doctor', reason: 'Small streaks of blood should still be evaluated by a doctor to rule out serious conditions, though often due to hemorrhoids.', confidence: 'medium' }
  }
  return { outcome: 'see_doctor', reason: 'Any blood in the stool generally warrants a medical consultation.', confidence: 'low' }
}


function evaluateNumbnessWeaknessPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const onset = getAnswer(answers, 'nw_onset')
  
  if (onset === 'gradual') {
    return { outcome: 'see_doctor', reason: 'Gradual onset of numbness or weakness should be evaluated by a neurologist or primary care doctor.', confidence: 'high' }
  }
  return { outcome: 'see_doctor', reason: 'Any unexplained numbness or weakness requires medical evaluation.', confidence: 'low' }
}

function evaluateConfusionPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  return { outcome: 'see_doctor', reason: 'Confusion or altered mental status always requires clinical evaluation to determine the cause.', confidence: 'high' }
}

function evaluateSeizurePathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const history = getAnswer(answers, 'seizure_history')
  if (history === 'known_epilepsy') {
    return { outcome: 'see_doctor', reason: 'A breakthrough seizure in someone with known epilepsy should be discussed with their neurologist.', confidence: 'high' }
  }
  return { outcome: 'see_doctor', reason: 'Any seizure activity requires medical follow-up.', confidence: 'low' }
}

function evaluateFaintingPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  return { outcome: 'see_doctor', reason: 'Fainting (syncope) should be evaluated by a doctor to rule out underlying cardiac or neurological causes.', confidence: 'high' }
}

function evaluateJointPainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const injury = getAnswer(answers, 'joint_pain_injury')
  if (injury === 'yes_minor') {
    return { outcome: 'monitor', reason: 'Minor joint injuries can often be monitored with RICE (Rest, Ice, Compression, Elevation).', confidence: 'medium' }
  }
  if (injury === 'no') {
    return { outcome: 'see_doctor', reason: 'Unexplained persistent joint pain should be evaluated.', confidence: 'high' }
  }
  return { outcome: 'see_doctor', reason: 'Joint pain requires evaluation if severe or persistent.', confidence: 'low' }
}

function evaluateMuscleStrainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const severity = getAnswer(answers, 'muscle_strain_severity')
  if (severity === 'stiff') {
    return { outcome: 'self_care', reason: 'Mild muscle strains and stiffness can usually be managed with rest and over-the-counter pain relief.', confidence: 'high' }
  }
  if (severity === 'painful_move') {
    return { outcome: 'monitor', reason: 'Monitor the muscle strain and rest it. Seek care if it worsens.', confidence: 'medium' }
  }
  return { outcome: 'see_doctor', reason: 'Significant muscle pain should be evaluated.', confidence: 'low' }
}

function evaluateInsectBitePathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const infection = getAnswer(answers, 'insect_bite_infection')
  if (infection === 'yes') {
    return { outcome: 'see_doctor', reason: 'An expanding red area may indicate a secondary bacterial infection requiring antibiotics.', confidence: 'high' }
  }
  return { outcome: 'self_care', reason: 'Most minor insect bites can be managed with cold packs and anti-itch creams.', confidence: 'high' }
}

function evaluateEyeProblemPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const pain = getAnswer(answers, 'eye_pain')
  if (pain === 'mild') {
    return { outcome: 'monitor', reason: 'Mild eye irritation can be monitored. Seek care if it worsens or vision changes.', confidence: 'medium' }
  }
  return { outcome: 'see_doctor', reason: 'Eye problems should generally be evaluated by a professional to protect vision.', confidence: 'low' }
}

function evaluateEarPainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  const discharge = getAnswer(answers, 'ear_pain_discharge')
  if (discharge === 'yes') {
    return { outcome: 'see_doctor', reason: 'Ear discharge may indicate a ruptured eardrum or severe infection requiring prescription drops.', confidence: 'high' }
  }
  return { outcome: 'see_doctor', reason: 'Persistent ear pain usually requires an ear exam to check for infection.', confidence: 'high' }
}

function evaluateUrinarySymptomsPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  return { outcome: 'see_doctor', reason: 'Urinary symptoms typically require a urinalysis and potential antibiotics.', confidence: 'high' }
}

function evaluateMentalHealthPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  return { outcome: 'see_doctor', reason: 'Mental health concerns should be discussed with a professional who can provide appropriate support and treatment.', confidence: 'high' }
}

function evaluateToothacheDentalPainPathway(answers: Record<string, string | string[] | 'not_sure'>): { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' } {
  // By the time this pathway evaluator runs, the red flag check has already passed.
  // That means: dental_breathing=no AND dental_fever=no.
  // Now check for localized facial swelling, which requires urgent (same-day) dental care.
  const swelling = getAnswer(answers, 'dental_swelling')
  const duration = getAnswer(answers, 'dental_pain_duration')

  if (swelling === 'yes') {
    return {
      outcome: 'see_doctor',
      reason: 'Dental pain with localized facial swelling or difficulty opening the mouth may indicate a dental abscess or spreading soft tissue infection. This requires urgent evaluation by a dentist or oral surgeon — aim to be seen the same day or within 24 hours.',
      confidence: 'high',
    }
  }

  // Duration-based escalation for persistent pain without swelling
  if (duration === 'more_than_week') {
    return {
      outcome: 'see_doctor',
      reason: 'Dental pain lasting more than a week is unlikely to resolve on its own and requires a dental examination to diagnose the cause (e.g., cavity, cracked tooth, or abscess) and initiate treatment.',
      confidence: 'high',
    }
  }

  if (duration === 'a_few_days') {
    return {
      outcome: 'see_doctor',
      reason: 'Dental pain persisting for several days warrants a dental appointment. Over-the-counter pain relief may help manage discomfort in the meantime, but the underlying cause requires professional evaluation.',
      confidence: 'high',
    }
  }

  // Mild, recent, or unclear — still needs dental evaluation but less urgently
  return {
    outcome: 'see_doctor',
    reason: 'Dental pain usually indicates a dental issue such as a cavity, cracked tooth, or early gum infection. Schedule an appointment with a dentist for diagnosis and appropriate treatment.',
    confidence: 'medium',
  }
}

export function runEngine(context: StructuredContext): AssessmentResult {
  const { category, answers = {} } = context

  // 1. Check all red flags for the category FIRST
  const triggeredRedFlags = evaluateRedFlags(category, answers)
  if (triggeredRedFlags.length > 0) {
    const reason = triggeredRedFlags.map((rf) => rf.reasonText).join(' ')
    return {
      outcome: 'urgent',
      reason,
      triggeredRedFlags: triggeredRedFlags.map((rf) => rf.id),
      confidence: 'high',
      nextQuestionId: null,
    }
  }

  // 2. Check for the next unanswered relevant question
  const questions = getQuestionsForCategory(category)
  for (const question of questions) {
    // Check if branching condition applies
    if (question.appliesWhen && !question.appliesWhen(answers)) {
      continue
    }

    // If this question has not been answered yet
    if (answers[question.id] === undefined) {
      return {
        outcome: 'monitor',
        reason: `Awaiting response for: ${question.text}`,
        triggeredRedFlags: [],
        confidence: 'low',
        nextQuestionId: question.id,
      }
    }
  }

  // 3. All relevant questions answered — compute final outcome
  let finalOutcome: { outcome: AssessmentOutcome; reason: string; confidence: 'high' | 'medium' | 'low' }

  switch (category) {
    case 'burn':
      finalOutcome = evaluateBurnPathway(answers)
      break
    case 'stomach_pain':
      finalOutcome = evaluateStomachPainPathway(answers)
      break
    case 'headache':
      finalOutcome = evaluateHeadachePathway(answers)
      break
    case 'fever':
      finalOutcome = evaluateFeverPathway(answers)
      break
    case 'cough':
      finalOutcome = evaluateCoughPathway(answers)
      break
    case 'rash':
      finalOutcome = evaluateRashPathway(answers)
      break
    case 'chest_pain':
      finalOutcome = evaluateChestPainPathway(answers)
      break
    case 'back_pain':
      finalOutcome = evaluateBackPainPathway(answers)
      break
    case 'dizziness':
      finalOutcome = evaluateDizzinessPathway(answers)
      break
    case 'cuts':
      finalOutcome = evaluateCutsPathway(answers)
      break
    case 'allergic_reaction':
      finalOutcome = evaluateAllergicReactionPathway(answers)
      break

    case 'fatigue':
      finalOutcome = evaluateFatiguePathway(answers)
      break
    case 'unexplained_weight_loss':
      finalOutcome = evaluateUnexplainedWeightLossPathway(answers)
      break

    case 'nausea_vomiting':
      finalOutcome = evaluateNauseaVomitingPathway(answers)
      break
    case 'diarrhea':
      finalOutcome = evaluateDiarrheaPathway(answers)
      break
    case 'constipation':
      finalOutcome = evaluateConstipationPathway(answers)
      break
    case 'blood_in_stool':
      finalOutcome = evaluateBloodInStoolPathway(answers)
      break

    case 'numbness_weakness':
      finalOutcome = evaluateNumbnessWeaknessPathway(answers)
      break
    case 'confusion':
      finalOutcome = evaluateConfusionPathway(answers)
      break
    case 'seizure':
      finalOutcome = evaluateSeizurePathway(answers)
      break
    case 'fainting':
      finalOutcome = evaluateFaintingPathway(answers)
      break
    case 'joint_pain':
      finalOutcome = evaluateJointPainPathway(answers)
      break
    case 'muscle_strain':
      finalOutcome = evaluateMuscleStrainPathway(answers)
      break
    case 'insect_bite':
      finalOutcome = evaluateInsectBitePathway(answers)
      break
    case 'eye_problem':
      finalOutcome = evaluateEyeProblemPathway(answers)
      break
    case 'ear_pain':
      finalOutcome = evaluateEarPainPathway(answers)
      break
    case 'urinary_symptoms':
      finalOutcome = evaluateUrinarySymptomsPathway(answers)
      break
    case 'mental_health_concern':
      finalOutcome = evaluateMentalHealthPathway(answers)
      break
    case 'toothache_dental_pain':
      finalOutcome = evaluateToothacheDentalPainPathway(answers)
      break
    default:



      finalOutcome = {
        outcome: 'see_doctor',
        reason: 'Unrecognized symptom category. Clinical evaluation recommended.',
        confidence: 'low',
      }
  }

  return {
    outcome: finalOutcome.outcome,
    reason: finalOutcome.reason,
    triggeredRedFlags: [],
    confidence: finalOutcome.confidence,
    nextQuestionId: null,
  }
}
