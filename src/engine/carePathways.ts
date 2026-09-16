import type { AssessmentOutcome, CarePathwayTemplate, SymptomCategory } from './types'

/**
 * ============================================================================
 * RAW STRUCTURED CARE PATHWAY TEMPLATES
 * ============================================================================
 *
 * NOTE (SAFETY CONSTRAINT FOR PART 5+):
 * In Part 5, an AI layer will be introduced to translate these templates into
 * friendly patient-facing conversational prose.
 *
 * THAT AI LAYER MUST STRICTLY AND ONLY REPHRASE THESE STRUCTURED BULLETS.
 * IT MUST NEVER INVENT, FABRICATE, OR EXTRAPOLATE NEW MEDICAL ADVICE, DOSAGES,
 * OR UNVALIDATED CLINICAL CLAIMS.
 * ============================================================================
 */

export const BASE_CARE_PATHWAYS: Record<AssessmentOutcome, CarePathwayTemplate> = {
  self_care: {
    outcome: 'self_care',
    label: 'Self-Care at Home',
    whatToDoNow: [
      'Rest in a comfortable, quiet environment and stay properly hydrated.',
      'Apply standard non-invasive first-aid measures appropriate to your symptom (e.g., cool running water for minor burns, light hydration for mild stomach ache).',
      'Avoid tight clothing, strenuous exertion, or known irritants.',
      'Over-the-counter pain relievers (such as acetaminophen or ibuprofen) may be used strictly following package directions if you have no allergies or contraindications.',
    ],
    whatToMonitor: [
      'Watch for changes in pain intensity over the next 12 to 24 hours.',
      'Check for development of new symptoms such as fever, rash, spreading redness, or dizziness.',
      'Ensure symptoms are improving steadily rather than plateauing or escalating.',
    ],
    whenToSeekImmediateCare: [
      'Pain suddenly spikes or becomes sharp and incapacitating.',
      'Development of high fever, persistent vomiting, or inability to retain liquids.',
      'Any emergence of red-flag signs (confusion, shortness of breath, blood in vomit or stool).',
    ],
  },

  monitor: {
    outcome: 'monitor',
    label: 'Active Monitoring & Re-evaluation',
    whatToDoNow: [
      'Record the exact time your symptoms started and note any specific triggers.',
      'Take resting vitals if equipment is available (temperature, pulse).',
      'Maintain adequate fluid intake in small, frequent sips.',
      'Avoid heavy meals, alcohol, screen glare, or physical strain during the observation window.',
    ],
    whatToMonitor: [
      'Re-assess symptom intensity every 2 to 4 hours.',
      'Track whether symptoms respond to rest and mild conservative measures.',
      'Note any progression, spreading boundaries, or new associated symptoms.',
    ],
    whenToSeekImmediateCare: [
      'Symptoms fail to improve within 24 to 48 hours, or actively worsen.',
      'Temperature rises above 101°F (38.3°C) or chills develop.',
      'Pain escalates from manageable to severe or spreads to other areas.',
      'Onset of dizziness, faintness, or altered mental alertness.',
    ],
  },

  see_doctor: {
    outcome: 'see_doctor',
    label: 'Schedule a Healthcare Provider Visit',
    whatToDoNow: [
      'Contact your primary care physician, local clinic, or a telehealth provider to book an evaluation within 24 to 48 hours.',
      'Prepare a concise timeline of your symptoms, medications currently taken, and home measures already tried.',
      'Keep the affected area protected and clean (e.g., clean non-adherent dressing for burns; avoid applying butter, oils, or unprescribed ointments).',
      'Stay resting and do not drive if you feel lightheaded, nauseated, or in moderate distress.',
    ],
    whatToMonitor: [
      'Monitor for signs of secondary bacterial infection (increased warmth, swelling, foul odor, spreading red streaks).',
      'Watch for fluid dehydration signs (dry mouth, dark concentrated urine, infrequent urination).',
      'Ensure your condition remains stable while awaiting your appointment.',
    ],
    whenToSeekImmediateCare: [
      'Condition deteriorates rapidly before your scheduled appointment.',
      'Pain becomes severe and unmanageable with standard home comfort measures.',
      'Development of difficulty breathing, persistent vomiting of blood, or sudden neurological deficits.',
    ],
  },

  urgent: {
    outcome: 'urgent',
    label: 'Urgent / Emergency Care Required',
    whatToDoNow: [
      'Call your local emergency number or go to the nearest emergency department immediately.',
      'Do NOT attempt to drive yourself if experiencing severe pain, confusion, dizziness, or visual disturbance — arrange an ambulance or have someone drive you.',
      'Stay as calm as possible, sit or lie down in a safe position, and loosen any restrictive clothing.',
      'If you are waiting for emergency services, keep someone with you and inform them of any known medical conditions, current medications, and allergies.',
    ],
    whatToMonitor: [
      'Continuously observe breathing rate, airway openness, and level of consciousness.',
      'Note any rapid changes in mental clarity, skin color (pallor or blueness), or responsiveness.',
      'Be prepared to report the exact onset time, progression, and all known medical allergies to the emergency team.',
    ],
    whenToSeekImmediateCare: [
      'THIS IS ALREADY AN URGENT CLINICAL SITUATION — ACT IMMEDIATELY WITHOUT DELAY.',
    ],
  },

}

/**
 * Category-specific clinical nuances layered on top of base pathways
 */
export const CATEGORY_CARE_NUANCES: Record<
  SymptomCategory,
  Partial<Record<AssessmentOutcome, Partial<CarePathwayTemplate>>>
> = {
  fever: {
    self_care: {
      whatToDoNow: [
        'Rest and stay hydrated by drinking clear fluids.',
        'Use light clothing and a single blanket.',
      ],
      whatToMonitor: [
        'Monitor temperature every 4-6 hours.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a medical appointment for evaluation of fever source.',
        'Keep a log of temperature readings.',
      ],
    },
  },
  cough: {
    self_care: {
      whatToDoNow: [
        'Stay hydrated and consider warm teas with honey (if over 1 year old) to soothe the throat.',
        'Use a humidifier to keep airway passages moist.',
      ],
      whatToMonitor: [
        'Note if the cough changes from dry to productive (bringing up mucus).',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Contact your physician for a respiratory assessment.',
        'Avoid over-the-counter cough suppressants unless directed by a doctor.',
      ],
    },
  },
  rash: {
    self_care: {
      whatToDoNow: [
        'Avoid scratching the rash to prevent infection.',
        'Apply a cool compress or an over-the-counter soothing lotion.',
      ],
      whatToMonitor: [
        'Watch for the rash spreading rapidly or changing color.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a clinical visit to have the rash evaluated by a medical professional.',
        'Note any new triggers, foods, or medications started recently.',
      ],
    },
  },
  chest_pain: {
    self_care: {
      whatToDoNow: [
        'Rest and avoid heavy lifting or strenuous activity.',
      ],
      whatToMonitor: [
        'If pain increases or changes character, seek immediate help.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a prompt medical appointment to evaluate chest pain.',
        'Avoid any strenuous physical activity until cleared by a doctor.',
      ],
    },
  },
  back_pain: {
    self_care: {
      whatToDoNow: [
        'Rest briefly, but try to maintain gentle movement to prevent stiffness.',
        'Apply heat or ice packs for 15-20 minutes at a time.',
      ],
      whatToMonitor: [
        'Monitor for any radiating pain down the legs or numbness.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule an appointment for a physical examination of your back.',
        'Avoid heavy lifting or twisting motions.',
      ],
    },
  },
  dizziness: {
    self_care: {
      whatToDoNow: [
        'Sit or lie down immediately to prevent a fall.',
        'Drink fluids, as dehydration can cause mild dizziness.',
      ],
      whatToMonitor: [
        'Monitor if dizziness occurs only when standing up quickly.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Consult a doctor for a full clinical evaluation.',
        'Do not drive or operate heavy machinery while experiencing dizziness.',
      ],
    },
  },
  cuts: {
    self_care: {
      whatToDoNow: [
        'Wash the cut gently with mild soap and water.',
        'Apply an antibiotic ointment and cover with a sterile bandage.',
      ],
      whatToMonitor: [
        'Check daily for increased redness, swelling, or pus.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Seek medical attention for proper wound cleaning and possible closure.',
        'Check if your tetanus vaccination is up to date.',
      ],
    },
  },
  allergic_reaction: {
    self_care: {
      whatToDoNow: [
        'Remove yourself from the suspected allergen if known.',
        'Over-the-counter antihistamines may be used following package directions for mild itching.',
      ],
      whatToMonitor: [
        'Watch closely for any swelling of the face/lips or breathing difficulty.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Contact your doctor for allergy testing or prescription management.',
        'Keep a log of exposures prior to the reaction.',
      ],
    },
  },

  fatigue: {
    self_care: {
      whatToDoNow: [
        'Ensure you are getting 7-9 hours of quality sleep per night.',
        'Stay well-hydrated and maintain a balanced diet.',
        'Try light stretching or a short walk to boost energy levels gently.',
      ],
      whatToMonitor: [
        'Track your sleep patterns and daily energy levels for a week.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a routine checkup to run basic blood tests (e.g., iron levels, thyroid function).',
        'Keep a diary of your daily fatigue levels and any other symptoms.',
      ],
    },
  },
  unexplained_weight_loss: {
    self_care: {
      whatToDoNow: [
        'Ensure you are eating regular, balanced meals.',
        'Avoid skipping meals and consider nutrient-dense snacks.',
      ],
      whatToMonitor: [
        'Weigh yourself once a week at the same time of day to track trends accurately.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a doctor\'s appointment to investigate the cause of the weight loss.',
        'Keep a log of your daily food intake and any other symptoms like increased thirst or night sweats.',
      ],
    },
  },

  nausea_vomiting: {
    self_care: {
      whatToDoNow: [
        'Rest your stomach; do not eat solid food for a few hours.',
        'Slowly sip clear liquids (water, clear broths, oral rehydration solutions).',
      ],
      whatToMonitor: [
        'Monitor for signs of dehydration like dry mouth, dark urine, or feeling dizzy when standing.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Contact your doctor to discuss your symptoms and get recommendations for anti-nausea medication.',
        'Keep trying to take small, frequent sips of fluid if tolerated.',
      ],
    },
  },
  diarrhea: {
    self_care: {
      whatToDoNow: [
        'Drink plenty of clear fluids or oral rehydration solutions to replace lost water and electrolytes.',
        'Eat bland foods like bananas, rice, applesauce, and toast (BRAT diet) once you feel hungry.',
      ],
      whatToMonitor: [
        'Watch for decreased urination or extreme thirst indicating dehydration.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a medical evaluation. Avoid taking over-the-counter anti-diarrhea medicines without consulting a doctor.',
        'Continue to hydrate as much as possible.',
      ],
    },
  },
  constipation: {
    self_care: {
      whatToDoNow: [
        'Increase your intake of high-fiber foods and drink plenty of water.',
        'Engage in light physical activity like walking to help stimulate bowel movements.',
      ],
      whatToMonitor: [
        'Keep track of bowel movements and any accompanying abdominal pain.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Consult your doctor for advice on safe laxatives or stool softeners.',
        'Do not use enemas or strong laxatives without medical guidance.',
      ],
    },
  },
  blood_in_stool: {
    see_doctor: {
      whatToDoNow: [
        'Schedule an appointment with your doctor or a gastroenterologist promptly.',
        'Note the color and amount of blood, and take photos if possible.',
      ],
    },
  },

  numbness_weakness: {
    see_doctor: {
      whatToDoNow: [
        'Schedule a medical evaluation. Do not ignore new neurological symptoms.',
        'Note exactly when the symptoms started and what body parts are affected.',
      ],
    },
  },
  confusion: {
    see_doctor: {
      whatToDoNow: [
        'Ensure the person is in a safe environment and supervise them.',
        'Contact a doctor promptly for evaluation.',
      ],
    },
  },
  seizure: {
    see_doctor: {
      whatToDoNow: [
        'Follow up with a neurologist as soon as possible.',
        'Ensure the person does not drive or operate machinery until cleared by a doctor.',
      ],
    },
  },
  fainting: {
    see_doctor: {
      whatToDoNow: [
        'Schedule an appointment with a doctor for a thorough cardiovascular and neurological check.',
        'Avoid driving or strenuous activity until evaluated.',
      ],
    },
  },
  joint_pain: {
    self_care: {
      whatToDoNow: [
        'Rest the joint and avoid activities that cause pain.',
        'Apply ice wrapped in a towel for 15-20 minutes a few times a day.',
      ],
      whatToMonitor: [
        'Watch for worsening pain, swelling, or redness.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a medical evaluation for the joint.',
        'Avoid bearing heavy weight on the joint.',
      ],
    },
  },
  muscle_strain: {
    self_care: {
      whatToDoNow: [
        'Use the RICE method: Rest, Ice, Compression, and Elevation.',
        'Take over-the-counter pain relievers if needed and safe for you.',
      ],
      whatToMonitor: [
        'Ensure the pain is gradually improving over a few days.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a medical evaluation for the muscle.',
        'Avoid stretching or stressing the injured muscle.',
      ],
    },
  },
  insect_bite: {
    self_care: {
      whatToDoNow: [
        'Wash the bite area with soap and water.',
        'Apply a cold compress and use over-the-counter hydrocortisone cream for itching.',
      ],
      whatToMonitor: [
        'Watch for spreading redness, increased pain, or systemic symptoms like fever.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Schedule a doctor\'s visit for a suspected infection.',
        'Do not scratch the bite, as this can worsen infection.',
      ],
    },
  },
  eye_problem: {
    see_doctor: {
      whatToDoNow: [
        'See an eye doctor (optometrist or ophthalmologist) or visit urgent care promptly.',
        'Do not rub the eye or use any drops not prescribed by a doctor.',
      ],
    },
  },
  ear_pain: {
    see_doctor: {
      whatToDoNow: [
        'Schedule a doctor\'s visit for an ear exam.',
        'Use over-the-counter pain relievers to manage discomfort in the meantime if safe for you.',
      ],
    },
  },
  urinary_symptoms: {
    see_doctor: {
      whatToDoNow: [
        'Drink plenty of water to help flush bacteria from your system.',
        'Schedule a medical evaluation to provide a urine sample.',
      ],
    },
  },
  mental_health_concern: {
    see_doctor: {
      whatToDoNow: [
        'Reach out to a mental health professional, primary care doctor, or a trusted support system.',
        'If you feel overwhelmed, consider calling a crisis hotline or going to an emergency room.',
      ],
    },
  },
  toothache_dental_pain: {
    see_doctor: {
      whatToDoNow: [
        'Schedule an appointment with a dentist as soon as possible.',
        'Rinse your mouth with warm saltwater to keep the area clean.',
      ],
    },
  },
  burn: {
    self_care: {
      whatToDoNow: [
        'Immediately cool the burn under cool (not ice-cold) running tap water for 10 to 20 minutes.',
        'Gently remove rings, watches, or tight clothing around the burned area before swelling begins. Do NOT pull off clothing stuck to the burn.',
        'Cover with a clean, sterile, non-adherent gauze bandage or clean plastic cling film.',
        'Never apply ice, butter, grease, toothpaste, or unprescribed home remedies.',
      ],
      whatToMonitor: [
        'Check that blisters do NOT break open. Never pop or puncture blisters.',
        'Observe for spreading redness, increased warmth, or worsening throbbing over the next 48 hours.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Cool with room-temperature clean running water for 10 minutes, then cover loosely with a sterile dressing.',
        'Schedule evaluation by a clinician or urgent care center today for prescription burn dressing and infection prevention.',
        'Verify your tetanus vaccination status (recommended within the last 5-10 years for contaminated or partial-thickness burns).',
      ],
    },
  },

  stomach_pain: {
    self_care: {
      whatToDoNow: [
        'Rest in a comfortable position (many find curling knees to chest or lying on the left side helpful).',
        'Sip clear fluids (water, broth, oral rehydration solution) slowly; avoid large gulps.',
        'Avoid solid foods, caffeine, dairy, acidic citrus, NSAIDs (ibuprofen/aspirin), and alcohol until pain settles.',
      ],
      whatToMonitor: [
        'Monitor for migration of pain (e.g., pain shifting from around belly button down to lower right abdomen).',
        'Track bowel movements and verify absence of black or bloody stools.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Contact your doctor or visit urgent care within 24 hours.',
        'Avoid taking laxatives or strong pain suppressants before evaluation as they can mask vital diagnostic signs.',
        'Maintain oral hydration with small sips if tolerated.',
      ],
    },
  },

  headache: {
    self_care: {
      whatToDoNow: [
        'Rest in a dark, quiet, well-ventilated room with cool temperature.',
        'Apply a cool damp cloth or gentle ice pack wrapped in a towel to forehead or temples.',
        'Drink a full glass of water, as mild dehydration is one of the most common headache triggers.',
        'Practice slow breathing and avoid looking at mobile or computer screens.',
      ],
      whatToMonitor: [
        'Check whether headache eases after 1 to 2 hours of rest and hydration.',
        'Ensure the headache does not change in character from dull/throbbing to sudden explosive sharp pain.',
      ],
    },
    see_doctor: {
      whatToDoNow: [
        'Consult your doctor or neurologist within 24 to 48 hours.',
        'Keep a headache log: note time of onset, duration, pain scale (1-10), food eaten, and sleep hours.',
        'Avoid overusing OTC painkillers (limit to < 2-3 days/week) to prevent medication-overuse rebound headaches.',
      ],
    },
  },
}

/**
 * Retrieve care pathway template customized for category and outcome
 */
export function getCarePathwayTemplate(
  outcome: AssessmentOutcome,
  category?: SymptomCategory
): CarePathwayTemplate {
  const base = BASE_CARE_PATHWAYS[outcome]
  if (!category) return base

  const nuance = CATEGORY_CARE_NUANCES[category]?.[outcome]
  if (!nuance) return base

  return {
    outcome: base.outcome,
    label: nuance.label || base.label,
    whatToDoNow: nuance.whatToDoNow || base.whatToDoNow,
    whatToMonitor: nuance.whatToMonitor || base.whatToMonitor,
    whenToSeekImmediateCare: nuance.whenToSeekImmediateCare || base.whenToSeekImmediateCare,
  }
}
