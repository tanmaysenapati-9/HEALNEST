/**
 * HEALNEST — Shared utilities and constants
 *
 * This file will grow as more parts are added:
 * - PART 3: API client utilities for AI calls
 * - PART 4: LocalStorage helpers for health history
 * - PART 5: Safety engine utility functions
 * - PART 7: Session management helpers
 */

/** App-wide constants */
export const APP_NAME = 'HEALNEST'
export const APP_TAGLINE = 'From Symptoms to the Right Next Step'

/** Supported languages */
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'hi', label: 'Hindi' },
] as const

/** Triage levels (PART 5: Will be used by the safety engine) */
export const TRIAGE_LEVELS = {
  EMERGENCY: 'emergency',
  URGENT: 'urgent',
  ROUTINE: 'routine',
  SELF_CARE: 'self-care',
} as const
