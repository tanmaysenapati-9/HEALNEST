import type { SymptomCategory, AssessmentOutcome, StructuredContext, AssessmentResult } from '../engine/types'
import type { CaregiverContext } from '../context/AssessmentContext'

export interface TimelineEntry {
  id: string
  date: string // ISO string
  category: SymptomCategory
  outcome: AssessmentOutcome
  briefDescription: string
  structuredContext: StructuredContext
  assessmentResult: AssessmentResult
  caregiverContext?: CaregiverContext
}

const STORAGE_KEY = 'healnesti_timeline'

// Demo seed data
const SEED_DATA: TimelineEntry[] = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    category: 'headache',
    outcome: 'self_care',
    briefDescription: 'Woke up with a mild headache, drank water and it slowly faded.',
    structuredContext: {
      category: 'headache',
      freeTextDescription: 'Woke up with a mild headache, drank water and it slowly faded.',
      answers: { headache_duration: 'Less than a day' },
    },
    assessmentResult: {
      outcome: 'self_care',
      triggeredRedFlags: [],
    } as any,
    caregiverContext: 'Me',
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days ago
    category: 'stomach_pain',
    outcome: 'urgent',
    briefDescription: 'Severe stabbing pain in lower right abdomen.',
    structuredContext: {
      category: 'stomach_pain',
      freeTextDescription: 'Severe stabbing pain in lower right abdomen.',
      answers: { stomach_pain_severity: 'Severe' },
    },
    assessmentResult: {
      outcome: 'urgent',
      triggeredRedFlags: ['Severe pain'],
    } as any,
    caregiverContext: 'Me',
  },
]

export function getTimelineEntries(): TimelineEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (!data) {
      // Seed on first load
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA))
      return SEED_DATA
    }
    return JSON.parse(data)
  } catch (e) {
    console.error('Failed to read timeline from localStorage', e)
    return []
  }
}

export function saveTimelineEntry(entry: TimelineEntry) {
  try {
    const entries = getTimelineEntries()
    // Avoid duplicates by ID
    const hasSameId = entries.some(e => e.id === entry.id)
    
    // Avoid duplicates by content and timestamp (React strict mode double-renders)
    const hasSimilarContent = entries.some(e => {
      if (e.category !== entry.category) return false
      if (e.briefDescription !== entry.briefDescription) return false
      
      const timeDiffMs = Math.abs(new Date(e.date).getTime() - new Date(entry.date).getTime())
      return timeDiffMs < 5000 // Within 5 seconds
    })

    if (!hasSameId && !hasSimilarContent) {
      // Add to beginning (reverse-chronological)
      const newEntries = [entry, ...entries]
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries))
    }
  } catch (e) {
    console.error('Failed to save timeline entry to localStorage', e)
  }
}

export function clearTimeline() {
  localStorage.removeItem(STORAGE_KEY)
}
