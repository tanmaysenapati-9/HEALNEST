import { z } from 'zod'

/**
 * Zod Schema for Natural Language Symptom Extraction
 *
 * CRITICAL CONSTRAINT:
 * This schema extracts ONLY descriptive symptom fields and categorizes them into
 * one of the supported pathways ('burn', 'stomach_pain', 'headache') or 'unrecognized'.
 *
 * It contains NO fields for:
 * - urgency decisions
 * - severity determinations
 * - medical triage or outcome recommendations
 */

export const ExtractedFieldsSchema = z.object({
  cause: z
    .string()
    .optional()
    .describe('Specific precipitating factor or cause if mentioned by the user (e.g. "boiling water", "hot iron")'),
  bodyArea: z
    .string()
    .optional()
    .describe('Anatomical location of the symptom (e.g. "hand", "upper abdomen", "temples")'),
  approximateDuration: z
    .string()
    .optional()
    .describe('Duration or timing mentioned by user (e.g. "20 minutes ago", "since yesterday", "3 days")'),
  otherMentionedSymptoms: z
    .array(z.string())
    .optional()
    .describe('Any additional associated sensations mentioned (e.g. "nausea", "throbbing", "dizziness")'),
})

export const SymptomExtractionResultSchema = z.object({
  category: z
    .enum(['burn', 'stomach_pain', 'headache', 'fever', 'cough', 'rash', 'chest_pain', 'back_pain', 'dizziness', 'cuts', 'allergic_reaction', 'fatigue', 'unexplained_weight_loss', 'nausea_vomiting', 'diarrhea', 'constipation', 'blood_in_stool', 'numbness_weakness', 'confusion', 'seizure', 'fainting', 'joint_pain', 'muscle_strain', 'insect_bite', 'eye_problem', 'ear_pain', 'urinary_symptoms', 'mental_health_concern', 'toothache_dental_pain', 'unrecognized'])
    .describe('The detected primary pathway, or "unrecognized" if it does not clearly match one of the supported pathways.'),
  extractedFields: ExtractedFieldsSchema.default({}),
  originalText: z
    .string()
    .describe('The exact verbatim symptom text submitted by the user.'),
  confidence: z
    .enum(['high', 'medium', 'low'])
    .describe('Confidence level in the categorization based strictly on the text provided.'),
})

export type ExtractedFields = z.infer<typeof ExtractedFieldsSchema>
export type SymptomExtractionResult = z.infer<typeof SymptomExtractionResultSchema>
