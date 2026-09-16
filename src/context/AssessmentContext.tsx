import React, { createContext, useContext, useState, type ReactNode } from 'react'
import type { SymptomCategory, StructuredContext, AssessmentResult } from '../engine/types'
import type { SymptomExtractionResult } from '../ai/extractionSchema'

export type CaregiverContext = 'Me' | 'My Child' | 'My Parent' | 'Someone Else'

interface AssessmentContextType {
  assessmentId: string
  caregiverContext: CaregiverContext
  rawText: string
  extractionResult: SymptomExtractionResult | null
  selectedCategory: SymptomCategory | null
  answers: Record<string, string | string[] | 'not_sure'>
  structuredContext: StructuredContext | null
  assessmentResult: AssessmentResult | null
  questionHistory: string[]
  isDemoMode: boolean
  setCaregiverContext: (ctx: CaregiverContext) => void
  setRawText: (text: string) => void
  setExtractionResult: (result: SymptomExtractionResult) => void
  setSelectedCategory: (category: SymptomCategory) => void
  setAnswer: (questionId: string, value: string | string[] | 'not_sure') => void
  setAssessmentResult: (result: AssessmentResult | null) => void
  pushQuestionHistory: (questionId: string) => void
  popQuestionHistory: () => string | undefined
  setIsDemoMode: (val: boolean) => void
  resetAssessment: () => void
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined)

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [assessmentId, setAssessmentId] = useState(() => crypto.randomUUID())
  const [caregiverContext, setCaregiverContext] = useState<CaregiverContext>('Me')
  const [rawText, setRawText] = useState('')
  const [extractionResult, setExtractionResultState] = useState<SymptomExtractionResult | null>(null)
  const [selectedCategory, setSelectedCategoryState] = useState<SymptomCategory | null>(null)
  const [answers, setAnswers] = useState<Record<string, string | string[] | 'not_sure'>>({})
  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null)
  const [questionHistory, setQuestionHistory] = useState<string[]>([])
  const [isDemoMode, setIsDemoMode] = useState(false)

  const setExtractionResult = (result: SymptomExtractionResult) => {
    setExtractionResultState(result)
    // Clear old assessment answers, history, and results on new extraction
    setAnswers({})
    setQuestionHistory([])
    setAssessmentResult(null)
    if (result.category !== 'unrecognized') {
      setSelectedCategoryState(result.category)
    } else {
      setSelectedCategoryState(null)
    }
  }

  const setSelectedCategory = (category: SymptomCategory) => {
    setSelectedCategoryState(category)
    // Clear answers and history if category changes
    setAnswers({})
    setQuestionHistory([])
    setAssessmentResult(null)
  }

  const setAnswer = (questionId: string, value: string | string[] | 'not_sure') => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }))
  }

  const pushQuestionHistory = (questionId: string) => {
    setQuestionHistory((prev) => {
      if (prev[prev.length - 1] === questionId) return prev
      return [...prev, questionId]
    })
  }

  const popQuestionHistory = (): string | undefined => {
    if (questionHistory.length === 0) return undefined
    const last = questionHistory[questionHistory.length - 1]
    setQuestionHistory((prev) => prev.slice(0, -1))
    return last
  }

  const resetAssessment = () => {
    setAssessmentId(crypto.randomUUID())
    setCaregiverContext('Me')
    setRawText('')
    setExtractionResultState(null)
    setSelectedCategoryState(null)
    setAnswers({})
    setQuestionHistory([])
    setAssessmentResult(null)
    setIsDemoMode(false)
  }

  // Construct validated StructuredContext ready for the Part 2 rule engine
  // MEMOIZED to prevent creating a new object reference on every render, which causes infinite loops
  const structuredContext = React.useMemo<StructuredContext | null>(() => {
    return selectedCategory
      ? {
        category: selectedCategory,
        answers,
        freeTextDescription: rawText,
      }
      : null
  }, [selectedCategory, answers, rawText])

  return (
    <AssessmentContext.Provider
      value={{
        assessmentId,
        caregiverContext,
        rawText,
        extractionResult,
        selectedCategory,
        answers,
        structuredContext,
        assessmentResult,
        questionHistory,
        isDemoMode,
        setCaregiverContext,
        setRawText,
        setExtractionResult,
        setSelectedCategory,
        setAnswer,
        setAssessmentResult,
        pushQuestionHistory,
        popQuestionHistory,
        setIsDemoMode,
        resetAssessment,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  )
}

export function useAssessment() {
  const context = useContext(AssessmentContext)
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider')
  }
  return context
}
