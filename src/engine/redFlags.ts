import type { RedFlagRule, SymptomCategory } from './types'

/**
 * Safe helper to check whether a specific question answer or multi-select array contains a target value
 */
function hasValue(
  answers: Record<string, string | string[] | 'not_sure'>,
  questionId: string,
  target: string
): boolean {
  const answer = answers[questionId]
  if (!answer) return false
  if (Array.isArray(answer)) {
    return answer.includes(target)
  }
  return answer === target
}

/**
 * Deterministic Red Flag Rules per Symptom Pathway
 *
 * Each rule evaluates the structured answers and determines whether
 * the patient requires immediate emergency / urgent escalation.
 */
export const RED_FLAG_RULES: Record<SymptomCategory, RedFlagRule[]> = {
  burn: [
    {
      id: 'burn_airway_compromise',
      category: 'burn',
      resultOutcome: 'urgent',
      reasonText:
        'Suspected smoke inhalation, airway burn, or respiratory compromise is a critical medical emergency.',
      condition: (answers) => hasValue(answers, 'burn_breathing', 'yes'),
    },
    {
      id: 'burn_chemical_or_electrical',
      category: 'burn',
      resultOutcome: 'urgent',
      reasonText:
        'Chemical and electrical burns can cause deep, progressive tissue necrosis and cardiac arrhythmias requiring immediate emergency care.',
      condition: (answers) =>
        hasValue(answers, 'burn_cause', 'chemical') ||
        hasValue(answers, 'burn_cause', 'electricity'),
    },
    {
      id: 'burn_critical_location',
      category: 'burn',
      resultOutcome: 'urgent',
      reasonText:
        'Burns to high-risk sensitive anatomical locations (face, hands, feet, genitals, or major joints) require urgent specialist evaluation.',
      condition: (answers) => hasValue(answers, 'burn_location', 'yes'),
    },
    {
      id: 'burn_full_thickness',
      category: 'burn',
      resultOutcome: 'urgent',
      reasonText:
        'White, waxy, leathery, or charred/blackened skin indicates a full-thickness burn requiring urgent clinical debridement and specialized wound care.',
      condition: (answers) => hasValue(answers, 'burn_skin', 'white_blackened'),
    },
    {
      id: 'burn_extensive_partial_thickness',
      category: 'burn',
      resultOutcome: 'urgent',
      reasonText:
        'Extensive blistering or damaged skin larger than the palm size carries high risk of fluid depletion and severe infection.',
      condition: (answers) =>
        hasValue(answers, 'burn_size', 'larger_than_palm') &&
        (hasValue(answers, 'burn_skin', 'blistered') ||
          hasValue(answers, 'burn_skin', 'peeling_damaged')),
    },
  ],

  stomach_pain: [
    {
      id: 'stomach_peritonism_or_hematemesis',
      category: 'stomach_pain',
      resultOutcome: 'urgent',
      reasonText:
        'A rigid, board-like abdomen or vomiting blood / dark coffee-ground material indicates potential peritonitis or severe acute GI hemorrhage.',
      condition: (answers) => hasValue(answers, 'stomach_red_flags', 'yes'),
    },
    {
      id: 'stomach_severe_with_gi_bleeding',
      category: 'stomach_pain',
      resultOutcome: 'urgent',
      reasonText:
        'Severe abdominal pain accompanied by blood in stool or black tarry stools indicates acute internal gastrointestinal bleeding.',
      condition: (answers) =>
        hasValue(answers, 'stomach_severity', 'severe') &&
        hasValue(answers, 'stomach_associated', 'blood_in_stool'),
    },
    {
      id: 'stomach_severe_acute_whole_abdomen',
      category: 'stomach_pain',
      resultOutcome: 'urgent',
      reasonText:
        'Severe, incapacitating abdominal pain involving the whole abdomen or sudden acute onset requires urgent rule-out of perforation or bowel obstruction.',
      condition: (answers) =>
        hasValue(answers, 'stomach_severity', 'severe') &&
        (hasValue(answers, 'stomach_location', 'whole') ||
          hasValue(answers, 'stomach_duration', 'less_6h')),
    },
  ],

  headache: [
    {
      id: 'headache_direct_red_flags',
      category: 'headache',
      resultOutcome: 'urgent',
      reasonText:
        'Sudden explosive onset, "worst headache of life", or headache with high fever, neck stiffness, or focal neurological deficit requires immediate emergency care.',
      condition: (answers) => hasValue(answers, 'headache_red_flags', 'yes'),
    },
    {
      id: 'headache_thunderclap_onset',
      category: 'headache',
      resultOutcome: 'urgent',
      reasonText:
        'Sudden "thunderclap" headache peaking within seconds or minutes is a clinical hallmark of subarachnoid hemorrhage and requires emergency neuroimaging.',
      condition: (answers) =>
        hasValue(answers, 'headache_onset', 'sudden') &&
        (hasValue(answers, 'headache_severity', 'severe') ||
          hasValue(answers, 'headache_severity', 'worst_ever')),
    },
    {
      id: 'headache_worst_headache_of_life',
      category: 'headache',
      resultOutcome: 'urgent',
      reasonText:
        'The "worst headache of life" carries a high risk of acute intracranial hemorrhage or vascular catastrophe.',
      condition: (answers) => hasValue(answers, 'headache_severity', 'worst_ever'),
    },
    {
      id: 'headache_meningismus_or_neurological_deficit',
      category: 'headache',
      resultOutcome: 'urgent',
      reasonText:
        'Headache with neck stiffness and fever, acute vision loss, confusion, or focal neurological weakness indicates potential meningitis or intracranial event.',
      condition: (answers) =>
        hasValue(answers, 'headache_associated', 'stiff_neck_fever') ||
        hasValue(answers, 'headache_associated', 'vision_loss') ||
        hasValue(answers, 'headache_associated', 'confusion_weakness'),
    },
  ],

  fever: [
    {
      id: 'fever_high_temp',
      category: 'fever',
      resultOutcome: 'urgent',
      reasonText: 'High fever (103°F / 39.4°C or above) requires urgent clinical evaluation to rule out severe systemic infection.',
      condition: (answers) => hasValue(answers, 'fever_temperature', 'high'),
    },
    {
      id: 'fever_meningitis_sepsis_signs',
      category: 'fever',
      resultOutcome: 'urgent',
      reasonText: 'Fever accompanied by stiff neck, confusion, new rash, or breathing difficulty carries high risk of meningitis or sepsis.',
      condition: (answers) => 
        hasValue(answers, 'fever_associated', 'stiff_neck') || 
        hasValue(answers, 'fever_associated', 'confusion') || 
        hasValue(answers, 'fever_associated', 'breathing_diff'),
    },
  ],
  cough: [
    {
      id: 'cough_hemoptysis',
      category: 'cough',
      resultOutcome: 'urgent',
      reasonText: 'Coughing up blood indicates potential severe infection, pulmonary embolism, or malignancy requiring immediate emergency care.',
      condition: (answers) => hasValue(answers, 'cough_sputum', 'blood'),
    },
    {
      id: 'cough_respiratory_distress',
      category: 'cough',
      resultOutcome: 'urgent',
      reasonText: 'Severe shortness of breath at rest is a critical respiratory emergency.',
      condition: (answers) => hasValue(answers, 'cough_associated', 'shortness_breath'),
    },
  ],
  rash: [
    {
      id: 'rash_anaphylaxis',
      category: 'rash',
      resultOutcome: 'urgent',
      reasonText: 'Rash accompanied by facial/throat swelling or breathing difficulty indicates anaphylaxis, a life-threatening emergency.',
      condition: (answers) => hasValue(answers, 'rash_associated', 'yes'),
    },
    {
      id: 'rash_meningococcemia',
      category: 'rash',
      resultOutcome: 'urgent',
      reasonText: 'A rapidly spreading rash or non-blanching dark purple spots carries high risk of severe systemic allergic reaction or meningococcal disease.',
      condition: (answers) => hasValue(answers, 'rash_onset', 'sudden') || hasValue(answers, 'rash_appearance', 'purple_spots'),
    },
  ],
  chest_pain: [
    {
      id: 'chest_pain_acs',
      category: 'chest_pain',
      resultOutcome: 'urgent',
      reasonText: 'Crushing or squeezing chest pain, especially radiating to the arm, jaw, neck, or back, is a classic sign of acute myocardial infarction (heart attack).',
      condition: (answers) => 
        hasValue(answers, 'chest_pain_character', 'crushing') || 
        hasValue(answers, 'chest_pain_radiation', 'arm_jaw'),
    },
    {
      id: 'chest_pain_associated_symptoms',
      category: 'chest_pain',
      resultOutcome: 'urgent',
      reasonText: 'Chest pain associated with shortness of breath, cold sweats, or dizziness indicates cardiovascular compromise.',
      condition: (answers) => 
        hasValue(answers, 'chest_pain_associated', 'sob') || 
        hasValue(answers, 'chest_pain_associated', 'sweating') || 
        hasValue(answers, 'chest_pain_associated', 'dizziness'),
    },
  ],
  back_pain: [
    {
      id: 'back_pain_cauda_equina',
      category: 'back_pain',
      resultOutcome: 'urgent',
      reasonText: 'Loss of bowel/bladder control or severe leg numbness/weakness indicates cauda equina syndrome or severe spinal cord compression.',
      condition: (answers) => 
        hasValue(answers, 'back_pain_neurological', 'bowel_bladder') || 
        hasValue(answers, 'back_pain_neurological', 'numbness_weakness'),
    },
    {
      id: 'back_pain_major_trauma',
      category: 'back_pain',
      resultOutcome: 'urgent',
      reasonText: 'Back pain following major trauma requires emergency imaging to rule out spinal fracture.',
      condition: (answers) => hasValue(answers, 'back_pain_cause', 'major_trauma'),
    },
  ],
  dizziness: [
    {
      id: 'dizziness_stroke',
      category: 'dizziness',
      resultOutcome: 'urgent',
      reasonText: 'Dizziness accompanied by slurred speech, facial droop, or arm weakness suggests acute stroke.',
      condition: (answers) => hasValue(answers, 'dizziness_stroke_signs', 'yes'),
    },
    {
      id: 'dizziness_cardiac',
      category: 'dizziness',
      resultOutcome: 'urgent',
      reasonText: 'Dizziness with chest pain or shortness of breath suggests severe cardiac rhythm disturbances or ischemia.',
      condition: (answers) => hasValue(answers, 'dizziness_associated', 'yes'),
    },
  ],
  cuts: [
    {
      id: 'cuts_arterial_bleeding',
      category: 'cuts',
      resultOutcome: 'urgent',
      reasonText: 'Spurting or uncontrollable bleeding indicates major arterial injury requiring immediate hemorrhagic control.',
      condition: (answers) => hasValue(answers, 'cuts_bleeding', 'spurting'),
    },
    {
      id: 'cuts_embedded_object',
      category: 'cuts',
      resultOutcome: 'urgent',
      reasonText: 'Large embedded objects in wounds require safe extraction under medical supervision.',
      condition: (answers) => hasValue(answers, 'cuts_depth', 'embedded'),
    },
  ],
  allergic_reaction: [
    {
      id: 'allergy_anaphylaxis_airway',
      category: 'allergic_reaction',
      resultOutcome: 'urgent',
      reasonText: 'Swelling of face/lips/tongue or breathing difficulty is anaphylaxis, requiring immediate epinephrine and emergency care.',
      condition: (answers) => hasValue(answers, 'allergy_breathing', 'yes'),
    },
  ],

  fatigue: [
    {
      id: 'fatigue_cardiac_pulmonary',
      category: 'fatigue',
      resultOutcome: 'urgent',
      reasonText: 'Fatigue accompanied by chest pain or shortness of breath is a major red flag for acute cardiac or pulmonary issues.',
      condition: (answers) => hasValue(answers, 'fatigue_associated', 'chest_pain_sob'),
    },
  ],
  unexplained_weight_loss: [
    {
      id: 'weight_loss_significant',
      category: 'unexplained_weight_loss',
      resultOutcome: 'urgent',
      reasonText: 'Significant rapid weight loss (more than 10 lbs) requires prompt medical investigation to rule out severe metabolic or malignant disease.',
      condition: (answers) => hasValue(answers, 'weight_loss_amount', 'significant'),
    },
    {
      id: 'weight_loss_cancer_signs',
      category: 'unexplained_weight_loss',
      resultOutcome: 'urgent',
      reasonText: 'Weight loss combined with drenching night sweats or bloody stools is highly concerning for malignancy or severe systemic infection.',
      condition: (answers) => 
        hasValue(answers, 'weight_loss_associated', 'night_sweats') || 
        hasValue(answers, 'weight_loss_associated', 'bowel_changes'),
    },
  ],

  nausea_vomiting: [
    {
      id: 'nv_gi_bleed',
      category: 'nausea_vomiting',
      resultOutcome: 'urgent',
      reasonText: 'Vomiting blood or coffee-ground material indicates an upper gastrointestinal bleed, which is a medical emergency.',
      condition: (answers) => hasValue(answers, 'nv_appearance', 'blood') || hasValue(answers, 'nv_appearance', 'coffee_grounds'),
    },
    {
      id: 'nv_acute_abdomen',
      category: 'nausea_vomiting',
      resultOutcome: 'urgent',
      reasonText: 'Vomiting with severe abdominal pain or inability to keep fluids down can indicate an acute surgical abdomen or severe dehydration.',
      condition: (answers) => hasValue(answers, 'nv_associated', 'severe_pain') || hasValue(answers, 'nv_associated', 'no_fluids'),
    },
  ],
  diarrhea: [
    {
      id: 'diarrhea_gi_bleed',
      category: 'diarrhea',
      resultOutcome: 'urgent',
      reasonText: 'Bright red blood or black, tarry stools indicate gastrointestinal bleeding requiring immediate evaluation.',
      condition: (answers) => hasValue(answers, 'diarrhea_appearance', 'blood') || hasValue(answers, 'diarrhea_appearance', 'black_tarry'),
    },
    {
      id: 'diarrhea_severe_dehydration',
      category: 'diarrhea',
      resultOutcome: 'urgent',
      reasonText: 'Signs of severe dehydration require urgent intravenous fluid replacement.',
      condition: (answers) => hasValue(answers, 'diarrhea_hydration', 'yes'),
    },
  ],
  constipation: [
    {
      id: 'constipation_obstruction',
      category: 'constipation',
      resultOutcome: 'urgent',
      reasonText: 'Constipation combined with severe pain, vomiting, or a rigid abdomen indicates a possible bowel obstruction.',
      condition: (answers) => 
        hasValue(answers, 'constipation_associated', 'severe_pain') || 
        hasValue(answers, 'constipation_associated', 'vomiting') || 
        hasValue(answers, 'constipation_associated', 'swollen_abdomen'),
    },
  ],
  blood_in_stool: [
    {
      id: 'blood_stool_melena_or_large',
      category: 'blood_in_stool',
      resultOutcome: 'urgent',
      reasonText: 'Black tarry stools or large amounts of red blood indicate significant gastrointestinal bleeding.',
      condition: (answers) => hasValue(answers, 'blood_stool_color', 'black_tarry') || hasValue(answers, 'blood_stool_amount', 'large'),
    },
    {
      id: 'blood_stool_hypovolemia',
      category: 'blood_in_stool',
      resultOutcome: 'urgent',
      reasonText: 'Blood in stool accompanied by dizziness or shortness of breath indicates significant blood loss affecting circulation.',
      condition: (answers) => hasValue(answers, 'blood_stool_associated', 'yes'),
    },
  ],

  numbness_weakness: [
    {
      id: 'nw_stroke_signs',
      category: 'numbness_weakness',
      resultOutcome: 'urgent',
      reasonText: 'Sudden onset of numbness, weakness, or associated speech/vision changes are classic signs of a stroke requiring immediate emergency care.',
      condition: (answers) => 
        hasValue(answers, 'nw_onset', 'sudden') || 
        hasValue(answers, 'nw_location', 'one_side') || 
        hasValue(answers, 'nw_associated', 'yes'),
    },
  ],
  confusion: [
    {
      id: 'confusion_acute',
      category: 'confusion',
      resultOutcome: 'urgent',
      reasonText: 'Sudden confusion or confusion with fever/head injury indicates a potential acute brain injury or severe systemic infection.',
      condition: (answers) => 
        hasValue(answers, 'confusion_onset', 'sudden') || 
        hasValue(answers, 'confusion_associated', 'fever') || 
        hasValue(answers, 'confusion_associated', 'head_injury'),
    },
  ],
  seizure: [
    {
      id: 'seizure_status_or_first',
      category: 'seizure',
      resultOutcome: 'urgent',
      reasonText: 'Seizures lasting over 5 minutes, failure to wake up, or a first-time seizure requires immediate medical evaluation.',
      condition: (answers) => 
        hasValue(answers, 'seizure_duration', 'over_5_min') || 
        hasValue(answers, 'seizure_duration', 'not_waking') || 
        hasValue(answers, 'seizure_history', 'first_time') || 
        hasValue(answers, 'seizure_injury', 'yes'),
    },
  ],
  fainting: [
    {
      id: 'fainting_cardiac',
      category: 'fainting',
      resultOutcome: 'urgent',
      reasonText: 'Fainting during exertion or accompanied by chest pain/palpitations strongly suggests a dangerous cardiac condition.',
      condition: (answers) => 
        hasValue(answers, 'fainting_context', 'exertion') || 
        hasValue(answers, 'fainting_associated', 'yes'),
    },
  ],
  joint_pain: [
    {
      id: 'joint_pain_septic_fracture',
      category: 'joint_pain',
      resultOutcome: 'urgent',
      reasonText: 'A hot, red, swollen joint with fever suggests septic arthritis. Inability to bear weight after trauma suggests fracture. Both require urgent care.',
      condition: (answers) => 
        hasValue(answers, 'joint_pain_signs', 'yes') || 
        hasValue(answers, 'joint_pain_injury', 'yes_deformity'),
    },
  ],
  muscle_strain: [
    {
      id: 'muscle_strain_rupture',
      category: 'muscle_strain',
      resultOutcome: 'urgent',
      reasonText: 'Complete inability to move the muscle or signs of massive trauma (visible dent) indicate a potential muscle or tendon rupture requiring surgical evaluation.',
      condition: (answers) => 
        hasValue(answers, 'muscle_strain_severity', 'cannot_move') || 
        hasValue(answers, 'muscle_strain_swelling', 'yes'),
    },
  ],
  insect_bite: [
    {
      id: 'insect_bite_anaphylaxis',
      category: 'insect_bite',
      resultOutcome: 'urgent',
      reasonText: 'Signs of anaphylaxis (breathing difficulty, facial swelling) after an insect bite are a life-threatening emergency.',
      condition: (answers) => hasValue(answers, 'insect_bite_anaphylaxis', 'yes'),
    },
  ],
  eye_problem: [
    {
      id: 'eye_problem_emergency',
      category: 'eye_problem',
      resultOutcome: 'urgent',
      reasonText: 'Sudden vision loss, chemical exposure, or severe eye pain are vision-threatening emergencies.',
      condition: (answers) => 
        hasValue(answers, 'eye_vision', 'yes') || 
        hasValue(answers, 'eye_pain', 'chemical_trauma') || 
        hasValue(answers, 'eye_pain', 'severe_pain'),
    },
  ],
  ear_pain: [
    {
      id: 'ear_pain_mastoiditis',
      category: 'ear_pain',
      resultOutcome: 'urgent',
      reasonText: 'Ear pain with swelling behind the ear, severe dizziness, or high fever can indicate a severe spreading infection like mastoiditis.',
      condition: (answers) => hasValue(answers, 'ear_pain_associated', 'yes'),
    },
  ],
  urinary_symptoms: [
    {
      id: 'urinary_kidney_retention',
      category: 'urinary_symptoms',
      resultOutcome: 'urgent',
      reasonText: 'Complete inability to urinate or signs of a severe kidney infection (fever/back pain) require immediate clinical care.',
      condition: (answers) => 
        hasValue(answers, 'urinary_fever_back_pain', 'yes') || 
        hasValue(answers, 'urinary_retention', 'yes'),
    },
  ],
  mental_health_concern: [
    {
      id: 'mh_emergency',
      category: 'mental_health_concern',
      resultOutcome: 'urgent',
      reasonText: 'Thoughts of self-harm, harming others, or severe psychosis/hallucinations require an immediate psychiatric emergency response.',
      condition: (answers) => 
        hasValue(answers, 'mh_safety', 'yes') || 
        hasValue(answers, 'mh_reality', 'yes'),
    },
  ],
  toothache_dental_pain: [
    {
      id: 'dental_airway_compromise',
      category: 'toothache_dental_pain',
      resultOutcome: 'urgent',
      reasonText: 'Dental pain with difficulty swallowing or difficulty breathing may indicate a deep-space spreading infection (e.g., Ludwig\'s angina) that can rapidly compromise the airway. Call your local emergency number or go to the nearest emergency department immediately.',
      condition: (answers) =>
        hasValue(answers, 'dental_breathing', 'yes'),
    },
    {
      id: 'dental_systemic_infection',
      category: 'toothache_dental_pain',
      resultOutcome: 'urgent',
      reasonText: 'Dental pain accompanied by a high fever can indicate that the infection has spread beyond the tooth into surrounding tissue or the bloodstream, requiring urgent medical and dental evaluation.',
      condition: (answers) =>
        hasValue(answers, 'dental_fever', 'yes'),
    },
  ],
}

/**
 * Evaluate all red flag rules for a given symptom category
 * Returns array of triggered rules (empty if no red flags triggered)
 */
export function evaluateRedFlags(
  category: SymptomCategory,
  answers: Record<string, string | string[] | 'not_sure'>
): RedFlagRule[] {
  const rules = RED_FLAG_RULES[category] || []
  return rules.filter((rule) => {
    try {
      return rule.condition(answers)
    } catch {
      return false
    }
  })
}
