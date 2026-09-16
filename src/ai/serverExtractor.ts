import { generateContentWithRotation, DEFAULT_GEMINI_MODEL } from './keyRotation'
import {
  SymptomExtractionResultSchema,
  type SymptomExtractionResult,
} from './extractionSchema'
import type { SymptomCategory } from '../engine/types'
import { normalizeToEnglish } from './languageNormalizer'

const ALL_CATEGORIES: SymptomCategory[] = [
  'burn',
  'stomach_pain',
  'headache',
  'fever',
  'cough',
  'rash',
  'chest_pain',
  'back_pain',
  'dizziness',
  'cuts',
  'allergic_reaction',
  'fatigue',
  'unexplained_weight_loss',
  'nausea_vomiting',
  'diarrhea',
  'constipation',
  'blood_in_stool',
  'numbness_weakness',
  'confusion',
  'seizure',
  'fainting',
  'joint_pain',
  'muscle_strain',
  'insect_bite',
  'eye_problem',
  'ear_pain',
  'urinary_symptoms',
  'mental_health_concern',
  'toothache_dental_pain',
]

const SYSTEM_PROMPT = `You are a clinical Natural Language Understanding (NLU) symptom extractor for HEALNEST.
Your task is to extract structured clinical fields and map user health complaints—including colloquial expressions, informal phrases, and common typos—into the supported clinical symptom taxonomy.
You do NOT diagnose, provide medical advice, assess urgency, or decide triage outcomes.

Output ONLY a raw JSON object — no markdown, no code fences, no explanation text. Just the JSON.

JSON Schema:
{
  "category": string,  // Exactly one of the permitted categories below, or "unrecognized"
  "extractedFields": {
    "cause": string or undefined,               // Precipitating factor (e.g. "after eating", "hot water", "chewing")
    "bodyArea": string or undefined,            // Anatomical site (e.g. "hand", "head", "mouth", "stomach")
    "approximateDuration": string or undefined, // Timing/duration (e.g. "since yesterday", "for 2 days")
    "otherMentionedSymptoms": string[]          // Secondary symptoms if multiple are mentioned
  },
  "confidence": "high" | "medium" | "low"
}

PERMITTED CATEGORIES (MUST BE ONE OF THESE EXACT STRINGS):
${ALL_CATEGORIES.join(', ')}, unrecognized

NATURAL LANGUAGE, COLLOQUIAL, AND TYPO TOLERANCE RULES:
- Stomach / Digestive ("stomach_pain"):
  * Words/Phrases: "stomach hurts", "tummy ache", "belly pain", "abdominal cramps", "stomach is burning", "burning stomach", "bloated", "bloating after eating", "indigestion", "acidity", "acid reflux", "heartburn", "gut pain", "cramping"
  * Colloquial & Typos: "gastic", "gastric", "gas", "gassy", "stomch", "stomak", "stomache", "tummy", "belly", "gut"
  → Map to: "stomach_pain"

- Headache ("headache"):
  * Words/Phrases: "headache", "head hurts", "head is hurting", "head pain", "migraine", "throbbing head", "temple pain", "pounding in head"
  * Typos: "headake", "hedache", "head ache", "headach"
  → Map to: "headache"

- Fever ("fever"):
  * Words/Phrases: "fever", "feverish", "high temperature", "running a temperature", "running a fever", "chills", "feeling hot and cold", "pyrexia", "feel hot"
  * Typos: "fevr", "fevor", "feverr"
  → Map to: "fever"

- Dental / Oral Pain ("toothache_dental_pain"):
  * Words/Phrases: "tooth hurts", "toothache", "teeth hurt", "gum swollen", "pain when chewing", "tooth hurts when chewing", "jaw pain", "dental pain", "sore gums", "molar pain", "tooth ache is bad", "tooth pain and facial swelling"
  * Typos: "toothach", "tooth ache", "teath"
  → Map to: "toothache_dental_pain"

- Nausea & Vomiting ("nausea_vomiting"):
  * Words/Phrases: "nauseous", "nausea", "vomiting", "throwing up", "feel like throwing up", "puking", "queasy", "feel sick to stomach", "retching", "heaving"
  * Typos: "vomitting", "vomting", "nausia"
  → Map to: "nausea_vomiting"

- Diarrhea ("diarrhea"):
  * Words/Phrases: "diarrhea", "loose stools", "loose motion", "loose motions", "watery poop", "passing loose stools", "the runs", "frequent watery bowel"
  * Typos: "diarhea", "diarrhoea", "diarrea"
  → Map to: "diarrhea"

- Cough ("cough"):
  * Words/Phrases: "cough", "coughing", "hacking cough", "dry cough", "wet cough", "coughing up mucus", "phlegm", "congested chest"
  * Typos: "caugh", "cuff"
  → Map to: "cough"

- Burn or Scald ("burn"):
  * Words/Phrases: "burned", "scald", "hot liquid", "hot pan", "sunburn", "steam burn", "boiling water", "chemical burn"
  → Map to: "burn"

- Fainting / Syncope ("fainting"):
  * Words/Phrases: "fainted", "passed out", "blacked out", "feel like I might faint", "feeling faint", "loss of consciousness", "syncope", "collapsed"
  → Map to: "fainting"

- Dizziness / Vertigo ("dizziness"):
  * Words/Phrases: "dizzy", "dizziness", "lightheaded", "room spinning", "vertigo", "woozy", "unsteady on feet"
  → Map to: "dizziness"

- Chest Pain ("chest_pain"):
  * Words/Phrases: "chest pain", "tight chest", "chest pressure", "heart racing", "squeezing in chest", "angina"
  → Map to: "chest_pain"

- Rash & Skin ("rash"):
  * Words/Phrases: "rash", "itchy skin", "hives", "welts", "red bumps", "eczema", "skin breakout"
  → Map to: "rash"

- Back Pain ("back_pain"):
  * Words/Phrases: "back pain", "lower back hurt", "upper back ache", "spine pain", "lumbago", "stiff back"
  → Map to: "back_pain"

- Cuts & Wounds ("cuts"):
  * Words/Phrases: "cut hand", "bleeding wound", "laceration", "sliced finger", "scrape", "open wound"
  → Map to: "cuts"

- Joint Pain ("joint_pain"):
  * Words/Phrases: "joint pain", "knee pain", "elbow pain", "swollen joint", "arthritis", "stiff joints"
  → Map to: "joint_pain"

- Muscle Strain ("muscle_strain"):
  * Words/Phrases: "muscle strain", "pulled muscle", "muscle sore", "cramp", "muscle spasm", "strained muscle"
  → Map to: "muscle_strain"

- Insect Bite ("insect_bite"):
  * Words/Phrases: "insect bite", "bug bite", "bee sting", "wasp sting", "spider bite", "mosquito bite", "tick"
  → Map to: "insect_bite"

- Eye Problem ("eye_problem"):
  * Words/Phrases: "eye pain", "blurry vision", "red eye", "pink eye", "eye infection", "vision problem"
  → Map to: "eye_problem"

- Ear Pain ("ear_pain"):
  * Words/Phrases: "ear pain", "earache", "ear infection", "ringing in ear", "tinnitus", "blocked ear"
  → Map to: "ear_pain"

- Urinary Symptoms ("urinary_symptoms"):
  * Words/Phrases: "burning pee", "painful urination", "urine infection", "peeing often", "blood in urine", "UTI"
  → Map to: "urinary_symptoms"

- Mental Health ("mental_health_concern"):
  * Words/Phrases: "anxiety", "panic attack", "depressed", "depression", "overwhelmed", "mental health", "stressed out"
  → Map to: "mental_health_concern"

MULTIPLE SYMPTOMS PRESERVATION:
When the user mentions multiple symptoms (e.g. "I have fever and headache", "I have stomach pain and vomiting", "tooth pain and facial swelling"):
1. Select the primary / first mentioned symptom as the "category".
2. Add all secondary symptoms or signs to "extractedFields.otherMentionedSymptoms" (e.g. ["headache"], ["nausea_vomiting"], ["facial swelling"]).
3. Set confidence to "high".

CONFIDENCE GUIDELINES:
- "high": Clear symptom match, including standard typos and colloquial phrasing (e.g. "I have gastic", "I have fevr", "My stomch hurts", "My tooth ache is bad").
- "medium": Plausible match with minor ambiguity.
- "low": Genuinely vague or non-health input (e.g. "I have a weird feeling", "something feels off", "hello"). In this case, set category to "unrecognized".`

interface SymptomPattern {
  category: SymptomCategory
  patterns: RegExp[]
  defaultBodyArea?: string
}

const SYMPTOM_PATTERNS: SymptomPattern[] = [
  {
    category: 'stomach_pain',
    patterns: [
      /\b(gast(ic|ric)|gas|gassy|bloat(ed|ing)?)\b/i,
      /\b(stomach|stomch|stomak|stomache)\b/i,
      /\b(tummy|belly|abdomen|abdominal|gut)\b/i,
      /\b(indigestion|heartburn|acid\s*reflux|acidity)\b/i,
      /\bstomach\s+is\s+burning\b/i,
      /\bburning\s+stomach\b/i,
      /\bcramps?\s+in\s+(my\s+)?(stomach|belly|abdomen|tummy)\b/i,
      /\b(stomach|belly|tummy|gut)\s+(hurts?|ache|cramp|pain)\b/i,
    ],
    defaultBodyArea: 'abdomen',
  },
  {
    category: 'headache',
    patterns: [
      /\bhead(ache|ake|ach)\b/i,
      /\bhedache\b/i,
      /\bhead\s+(is\s+)?(hurts?|hurting|pain|aching|throbbing|pounding)\b/i,
      /\bmigraine\b/i,
      /\bpain\s+in\s+(my\s+)?head\b/i,
      /\btemples?\s+throb/i,
    ],
    defaultBodyArea: 'head',
  },
  {
    category: 'fever',
    patterns: [
      /\bfev(er|r|or)\b/i,
      /\bfeverish\b/i,
      /\b(high|elevated)\s+temp(erature)?\b/i,
      /\brunning\s+a\s+(fever|temp(erature)?)\b/i,
      /\bchills\b/i,
      /\bpyrexia\b/i,
      /\bfeeling\s+(hot\s+and\s+cold|burning\s+hot)\b/i,
      /\bhave\s+(a\s+)?(fever|fevr)\b/i,
      /\bgot\s+(a\s+)?(fever|fevr)\b/i,
    ],
  },
  {
    category: 'toothache_dental_pain',
    patterns: [
      /\btooth\s*(ache|ach)\b/i,
      /\b(tooth|teeth|teath)\s+(hurts?|pain|loose|ache)\b/i,
      /\btooth\s+ache\s+is\s+bad\b/i,
      /\b(tooth|teeth|gum)\s+pain\s+and\s+facial\s+swelling\b/i,
      /\bgums?\b/i,
      /\bdental\b/i,
      /\bpain\s+when\s+chew(ing)?\b/i,
      /\btooth\s+hurts\s+when\s+(i\s+)?chew(ing)?\b/i,
      /\bjaw\s+pain\b/i,
      /\bmolar\b/i,
      /\bgums?\s+(swollen|bleeding|hurt)\b/i,
    ],
    defaultBodyArea: 'mouth/teeth',
  },
  {
    category: 'nausea_vomiting',
    patterns: [
      /\bvomit(ing|ting|ed)?\b/i,
      /\bfeel(ing)?\s+like\s+throwing\s+up\b/i,
      /\bthrow(ing)?\s+up\b/i,
      /\bpuk(ing|ed|e)\b/i,
      /\bnause(a|ous|ated)\b/i,
      /\bqueas(y|iness)\b/i,
      /\bfeel\s+sick\s+to\s+(my\s+)?stomach\b/i,
      /\bretch(ing)?\b/i,
    ],
  },
  {
    category: 'diarrhea',
    patterns: [
      /\bdiarrh?(oea|ea)\b/i,
      /\bloose\s+motion(s)?\b/i,
      /\bloose\s+stools?\b/i,
      /\bpassing\s+loose\s+stools\b/i,
      /\bwatery\s+(stool|poop|bowel)\b/i,
      /\bthe\s+runs\b/i,
    ],
  },
  {
    category: 'cough',
    patterns: [
      /\b(cough|caugh|cuff)(ing|s)?\b/i,
      /\bphlegm\b/i,
      /\bmucus\s+in\s+throat\b/i,
      /\bhacking\b/i,
    ],
    defaultBodyArea: 'throat/chest',
  },
  {
    category: 'burn',
    patterns: [
      /\bburn(ed|t|ing)?\b/i,
      /\bscald(ed)?\b/i,
      /\bboiling\s+water\b/i,
      /\bhot\s+(oil|water|liquid|pan|iron|surface|stove)\b/i,
      /\bsunburn\b/i,
    ],
  },
  {
    category: 'chest_pain',
    patterns: [
      /\bchest\s+(pain|tight|pressure|heavy|ache|hurts?|squeez)/i,
      /\bangina\b/i,
      /\bpain\s+in\s+(my\s+)?chest\b/i,
    ],
    defaultBodyArea: 'chest',
  },
  {
    category: 'rash',
    patterns: [
      /\brash(es)?\b/i,
      /\bhives\b/i,
      /\bitchy\s+skin\b/i,
      /\beczema\b/i,
      /\bred\s+bumps?\b/i,
      /\bskin\s+(breakout|redness|irritation|welts)\b/i,
    ],
    defaultBodyArea: 'skin',
  },
  {
    category: 'fainting',
    patterns: [
      /\bfeel(ing)?\s+like\s+I\s+might\s+faint\b/i,
      /\bfaint(ed|ing)?\b/i,
      /\bpassed\s+out\b/i,
      /\bblacked\s+out\b/i,
      /\blost\s+consciousness\b/i,
      /\bsyncope\b/i,
      /\bcollaps(ed|ing)\b/i,
    ],
  },
  {
    category: 'dizziness',
    patterns: [
      /\bdizz(y|iness)\b/i,
      /\blightheaded(ness)?\b/i,
      /\bvertigo\b/i,
      /\broom\s+spinning\b/i,
      /\bwoozy\b/i,
      /\bunsteady\s+on\s+feet\b/i,
    ],
  },
  {
    category: 'back_pain',
    patterns: [
      /\bback\s+(pain|ache|hurts?|stiff|spasm)\b/i,
      /\blower\s+back\b/i,
      /\bupper\s+back\b/i,
      /\blumbago\b/i,
      /\bspine\s+pain\b/i,
    ],
    defaultBodyArea: 'back',
  },
  {
    category: 'cuts',
    patterns: [
      /\bcuts?\b/i,
      /\bwounds?\b/i,
      /\blacerat(ion|ed)\b/i,
      /\bscrape(d)?\b/i,
      /\bsliced\s+(my\s+)?(finger|hand|skin)\b/i,
      /\bbleeding\s+cut\b/i,
    ],
  },
  {
    category: 'allergic_reaction',
    patterns: [
      /\ballerg(y|ic)\s+(reaction)?\b/i,
      /\banaphylax(is|ic)\b/i,
      /\bswollen\s+(lips?|tongue|throat|face)\b/i,
    ],
  },
  {
    category: 'fatigue',
    patterns: [
      /\bfatigue(d)?\b/i,
      /\bexhaust(ed|ion)\b/i,
      /\bextreme(ly)?\s+tired\b/i,
      /\bno\s+energy\b/i,
      /\bletharg(ic|y)\b/i,
      /\brun\s+down\b/i,
    ],
  },
  {
    category: 'unexplained_weight_loss',
    patterns: [
      /\bweight\s+loss\b/i,
      /\blosing\s+weight\b/i,
      /\blost\s+weight\s+without\s+trying\b/i,
      /\bdropped\s+weight\b/i,
    ],
  },
  {
    category: 'constipation',
    patterns: [
      /\bconstipat(ed|ion)\b/i,
      /\bcan('?t|not)\s+poop\b/i,
      /\bhard\s+stool\b/i,
      /\bblocked\s+up\b/i,
      /\bbowel\s+stuck\b/i,
    ],
  },
  {
    category: 'blood_in_stool',
    patterns: [
      /\bblood\s+in\s+(my\s+)?(stool|poop|toilet)\b/i,
      /\bbloody\s+stool\b/i,
      /\brectal\s+bleed(ing)?\b/i,
      /\bblack\s+tarry\s+stool\b/i,
    ],
  },
  {
    category: 'numbness_weakness',
    patterns: [
      /\bnumb(ness)?\b/i,
      /\btingling\b/i,
      /\bpins\s+and\s+needles\b/i,
      /\bloss\s+of\s+feeling\b/i,
      /\bweakness\s+in\s+(my\s+)?(arm|leg|hand|face)\b/i,
    ],
  },
  {
    category: 'confusion',
    patterns: [
      /\bconfus(ed|ion)\b/i,
      /\bdisorient(ed|ation)\b/i,
      /\bbrain\s+fog\b/i,
      /\bbewilder(ed)?\b/i,
    ],
  },
  {
    category: 'seizure',
    patterns: [
      /\bseiz(ure|ing)\b/i,
      /\bconvuls(ion|ing)?\b/i,
      /\bepileptic\s+fit\b/i,
      /\bshaking\s+uncontrollably\b/i,
    ],
  },
  {
    category: 'joint_pain',
    patterns: [
      /\bjoint\s+(pain|ache|swelling|stiffness)\b/i,
      /\bknee\s+(pain|hurts?|swollen)\b/i,
      /\belbow\s+(pain|hurts?)\b/i,
      /\bshoulder\s+pain\b/i,
      /\bankle\s+(pain|swollen|twisted)\b/i,
      /\barthr(itis|itic)\b/i,
      /\bstiff\s+joints?\b/i,
    ],
    defaultBodyArea: 'joints',
  },
  {
    category: 'muscle_strain',
    patterns: [
      /\bmuscle\s+(strain|pulled|sore|spasm|cramp|ache|pain|tear)\b/i,
      /\bpulled\s+a\s+muscle\b/i,
      /\bcharley\s+horse\b/i,
    ],
    defaultBodyArea: 'muscle',
  },
  {
    category: 'insect_bite',
    patterns: [
      /\b(insect|bug|spider|mosquito|tick|flea)\s+bite(s)?\b/i,
      /\b(bee|wasp|hornet)\s+sting\b/i,
      /\bbit(ten)?\s+by\s+an?\s+(insect|bug|spider|tick|mosquito)\b/i,
    ],
  },
  {
    category: 'eye_problem',
    patterns: [
      /\beye\s+(pain|problem|infection|redness|discharge|irritation|hurts?)\b/i,
      /\bblurry\s+vision\b/i,
      /\bred\s+eye(s)?\b/i,
      /\bpink\s+eye\b/i,
      /\bvision\s+loss\b/i,
      /\bsomething\s+in\s+my\s+eye\b/i,
    ],
    defaultBodyArea: 'eye',
  },
  {
    category: 'ear_pain',
    patterns: [
      /\bear\s*(ache|pain|infection|hurts?)\b/i,
      /\btinnitus\b/i,
      /\bclogged\s+ear\b/i,
      /\bdischarge\s+from\s+ear\b/i,
    ],
    defaultBodyArea: 'ear',
  },
  {
    category: 'urinary_symptoms',
    patterns: [
      /\b(burning|painful)\s+(when\s+)?(pee(ing)?|urinat(ing|ion))\b/i,
      /\burin(ary|e)\s+(infection|pain|symptoms?)\b/i,
      /\bpeeing\s+(a\s+lot|frequently|often)\b/i,
      /\bblood\s+in\s+urine\b/i,
      /\bUTI\b/i,
      /\bdysuria\b/i,
    ],
    defaultBodyArea: 'urinary tract',
  },
  {
    category: 'mental_health_concern',
    patterns: [
      /\banxiet(y|ious)\b/i,
      /\bpanic\s+attack\b/i,
      /\bdepress(ed|ion)\b/i,
      /\bmental\s+health\b/i,
      /\bsevere(ly)?\s+stressed\b/i,
      /\boverwhelm(ed)?\b/i,
      /\bhopeless\b/i,
    ],
  },
]

/**
 * Deterministic heuristic fallback — handles typos, colloquial language,
 * multi-symptom extraction, and extracts duration/cause/body area.
 */
export function fallbackHeuristicExtraction(text: string): SymptomExtractionResult {
  const trimmed = text.trim()
  if (!trimmed) {
    return { category: 'unrecognized', extractedFields: {}, originalText: text, confidence: 'low' }
  }

  // Reject completely vague non-health strings
  if (/^(i\s+have\s+a\s+weird\s+feeling|something\s+feels\s+(wrong|off|weird)|i\s+don'?t\s+feel\s+good|hello|hi|help)$/i.test(trimmed)) {
    return { category: 'unrecognized', extractedFields: {}, originalText: trimmed, confidence: 'low' }
  }

  const detectedCategories: SymptomCategory[] = []
  const extractedFields: Record<string, any> = {}

  // 1. Detect all matching symptom categories
  for (const item of SYMPTOM_PATTERNS) {
    for (const pattern of item.patterns) {
      if (pattern.test(trimmed)) {
        if (!detectedCategories.includes(item.category)) {
          detectedCategories.push(item.category)
          if (item.defaultBodyArea && !extractedFields.bodyArea) {
            extractedFields.bodyArea = item.defaultBodyArea
          }
        }
        break
      }
    }
  }

  // 2. Extract anatomical body area if specific words found
  if (/\bhand(s)?\b/i.test(trimmed)) extractedFields.bodyArea = 'hand'
  else if (/\barm(s)?\b/i.test(trimmed)) extractedFields.bodyArea = 'arm'
  else if (/\bface\b/i.test(trimmed)) extractedFields.bodyArea = 'face'
  else if (/\bfoot|feet\b/i.test(trimmed)) extractedFields.bodyArea = 'foot'
  else if (/\bleg(s)?\b/i.test(trimmed)) extractedFields.bodyArea = 'leg'
  else if (/\bchest\b/i.test(trimmed)) extractedFields.bodyArea = 'chest'
  else if (/\bhead\b/i.test(trimmed)) extractedFields.bodyArea = 'head'
  else if (/\b(stomach|stomch|stomak|belly|abdomen|tummy)\b/i.test(trimmed)) extractedFields.bodyArea = 'abdomen'
  else if (/\b(tooth|teeth|gum|mouth)\b/i.test(trimmed)) extractedFields.bodyArea = 'mouth/teeth'

  // 3. Extract precipitating cause/mechanism & facial swelling
  if (/after\s+eating/i.test(trimmed)) extractedFields.cause = 'after eating'
  else if (/when\s+(i\s+)?chew(ing)?/i.test(trimmed)) extractedFields.cause = 'when chewing'
  else if (/boiling\s+water/i.test(trimmed)) extractedFields.cause = 'boiling water'
  else if (/hot\s+(oil|water|pan|iron|liquid)/i.test(trimmed)) extractedFields.cause = 'hot object/liquid'
  else if (/chemical/i.test(trimmed)) extractedFields.cause = 'chemical'

  if (/facial\s+swelling/i.test(trimmed)) {
    if (!extractedFields.otherMentionedSymptoms) extractedFields.otherMentionedSymptoms = []
    extractedFields.otherMentionedSymptoms.push('facial swelling')
  }

  // 4. Extract approximate duration
  const durationMatch = trimmed.match(
    /\b(since\s+(yesterday|this\s+morning|last\s+night|\d+\s*(?:days?|weeks?|hours?|months?)\s*(?:ago)?)|for\s+\d+\s*(?:minutes?|hours?|days?|weeks?|months?)|\d+\s*(?:minutes?|hours?|days?|weeks?|months?)\s*(?:ago)?)\b/i
  )
  if (durationMatch) {
    extractedFields.approximateDuration = durationMatch[1]
  }

  // 5. Build final result
  if (detectedCategories.length === 0) {
    return {
      category: 'unrecognized',
      extractedFields,
      originalText: trimmed,
      confidence: 'low',
    }
  }

  const primaryCategory = detectedCategories[0]
  const secondaryCategories = detectedCategories.slice(1)

  if (secondaryCategories.length > 0) {
    extractedFields.otherMentionedSymptoms = [
      ...(extractedFields.otherMentionedSymptoms || []),
      ...secondaryCategories
    ]
  }

  return {
    category: primaryCategory,
    extractedFields,
    originalText: trimmed,
    confidence: 'high',
  }
}

export async function performAIExtraction(
  apiKeys: string[],
  text: string,
  language: string = 'en'
): Promise<SymptomExtractionResult> {
  const trimmed = text.trim()
  if (!trimmed) {
    return { category: 'unrecognized', extractedFields: {}, originalText: text, confidence: 'low' }
  }

  // ── Multilingual Normalization ────────────────────────────────────────────
  // Detect Hindi (Devanagari) or Tamil script and translate to English before
  // running any regex heuristics or LLM extraction. The original verbatim text
  // is preserved in `originalText` for UI display.
  const noKeys = !apiKeys || apiKeys.length === 0 ||
    (apiKeys.length === 1 && (apiKeys[0].trim() === '' || apiKeys[0].includes('PLACEHOLDER')))

  let normalizedText = trimmed
  if (!noKeys) {
    try {
      const normResult = await normalizeToEnglish(trimmed, apiKeys)
      if (normResult.wasTranslated) {
        console.log(`[HEALNEST NLU] Language normalized (${normResult.detectedScript}): "${trimmed}" → "${normResult.normalizedEnglish}"`)
      }
      normalizedText = normResult.normalizedEnglish
    } catch (normErr) {
      console.warn('[HEALNEST NLU] Language normalization failed, using original text:', normErr)
    }
  } else {
    // No API keys — still try static dictionary for offline Hindi/Tamil support
    try {
      const normResult = await normalizeToEnglish(trimmed, [])
      if (normResult.wasTranslated) {
        normalizedText = normResult.normalizedEnglish
      }
    } catch {
      // ignore
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  if (noKeys) {
    // Run heuristic on normalized text, but return originalText for the UI
    const result = fallbackHeuristicExtraction(normalizedText)
    return { ...result, originalText: trimmed }
  }

  const userPrompt = `Extract structured fields from this symptom description:\n\n"${normalizedText}"\n\nRespond ONLY with a raw JSON object. No markdown fences.`
  const systemWithLang = SYSTEM_PROMPT

  try {
    const response = await generateContentWithRotation(apiKeys, {
      model: DEFAULT_GEMINI_MODEL,
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      config: {
        systemInstruction: systemWithLang,
        temperature: 0.1,
      },
    })

    const rawText = response.text || ''
    const cleaned = rawText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsedData = JSON.parse(cleaned)
    // Always attach the original (possibly non-Latin) user text
    const parsed = SymptomExtractionResultSchema.safeParse({ ...parsedData, originalText: trimmed })

    if (parsed.success && parsed.data.category !== 'unrecognized') {
      return parsed.data
    }

    // If model returned unrecognized or unparseable, check deterministic heuristic before giving up
    const heuristicResult = fallbackHeuristicExtraction(normalizedText)
    if (heuristicResult.category !== 'unrecognized') {
      return { ...heuristicResult, originalText: trimmed }
    }

    return parsed.success ? parsed.data : { ...heuristicResult, originalText: trimmed }
  } catch (error) {
    console.error('[HEALNEST NLU Error] AI extraction failed, falling back to heuristic:', error)
    const heuristicResult = fallbackHeuristicExtraction(normalizedText)
    return { ...heuristicResult, originalText: trimmed }
  }
}
