import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { StepIndicator, QuestionCard, Badge } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import { runEngine } from '../engine/pathwayEngine'
import { getQuestionById, getQuestionsForCategory } from '../engine/questionLibrary'
import type { SymptomCategory } from '../engine/types'

const CATEGORY_TITLES: Record<SymptomCategory, string> = {
  burn: 'Burn Assessment',
  stomach_pain: 'Stomach Pain Assessment',
  headache: 'Headache Assessment',
  fever: 'Fever Assessment',
  cough: 'Cough & Respiratory Assessment',
  rash: 'Skin Rash Assessment',
  chest_pain: 'Chest Pain Assessment',
  back_pain: 'Back Pain Assessment',
  dizziness: 'Dizziness & Vertigo Assessment',
  cuts: 'Cuts & Wounds Assessment',
  allergic_reaction: 'Allergic Reaction Assessment',
  fatigue: 'Fatigue Assessment',
  unexplained_weight_loss: 'Weight Loss Assessment',
  nausea_vomiting: 'Nausea & Vomiting Assessment',
  diarrhea: 'Diarrhea Assessment',
  constipation: 'Constipation Assessment',
  blood_in_stool: 'Blood in Stool Assessment',
  numbness_weakness: 'Numbness & Weakness Assessment',
  confusion: 'Confusion Assessment',
  seizure: 'Seizure Assessment',
  fainting: 'Fainting & Syncope Assessment',
  joint_pain: 'Joint Pain Assessment',
  muscle_strain: 'Muscle Strain Assessment',
  insect_bite: 'Insect Bite Assessment',
  eye_problem: 'Eye Problem Assessment',
  ear_pain: 'Ear Pain Assessment',
  urinary_symptoms: 'Urinary Symptoms Assessment',
  mental_health_concern: 'Mental Health Assessment',
  toothache_dental_pain: 'Dental Pain Assessment',
}

export function AssessQuestionsPage() {
  const navigate = useNavigate()
  const {
    structuredContext,
    selectedCategory,
    answers,
    setAnswer,
    setAssessmentResult,
    questionHistory,
    pushQuestionHistory,
    popQuestionHistory,
  } = useAssessment()

  // Graceful redirection if someone lands here directly without context
  useEffect(() => {
    if (!selectedCategory || !structuredContext) {
      navigate('/app/assess/start', { replace: true })
    }
  }, [selectedCategory, structuredContext, navigate])

  if (!selectedCategory || !structuredContext) {
    return null
  }

  // Pure presentation layer over Part 2 Rule Engine:
  // Call runEngine(context) to determine next question or outcome with debug logging
  let engineResult: any = null
  let engineError: any = null

  try {
    console.log('[HEALNEST AssessQuestionsPage] context passed to runEngine:', JSON.stringify(structuredContext, null, 2))
    engineResult = runEngine(structuredContext)
    console.log('[HEALNEST AssessQuestionsPage] AssessmentResult returned:', JSON.stringify(engineResult, null, 2))
  } catch (err) {
    engineError = err
    console.error('[HEALNEST AssessQuestionsPage] runEngine THREW ERROR:', err)
  }

  // RED-FLAG INTERRUPT & COMPLETION:
  // If outcome is 'urgent' (emergency red flag) or all questions answered, route to results immediately
  const hasRoutedRef = useRef(false)

  useEffect(() => {
    if (engineResult && !hasRoutedRef.current) {
      if (engineResult.outcome === 'urgent' || engineResult.nextQuestionId === null) {
        hasRoutedRef.current = true
        console.log('[HEALNEST AssessQuestionsPage] Routing to /app/assess/results with outcome:', engineResult.outcome)
        setAssessmentResult(engineResult)
        navigate('/app/assess/results', { replace: true })
      }
    }
  }, [engineResult?.outcome, engineResult?.nextQuestionId, navigate, setAssessmentResult, engineResult])

  if (engineError) {
    return (
      <div className="max-w-xl mx-auto p-6 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-300 space-y-3">
        <h2 className="font-bold text-lg">Error running triage engine</h2>
        <pre className="text-xs p-3 bg-black/40 rounded-lg overflow-auto">{String(engineError?.message || engineError)}</pre>
      </div>
    )
  }

  // If already routed or no next question, show transitional state instead of blank screen
  if (!engineResult || engineResult.outcome === 'urgent' || !engineResult.nextQuestionId) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center text-sm text-heal-text-muted">
        Finalizing assessment results...
      </div>
    )
  }

  const currentQuestion = getQuestionById(selectedCategory, engineResult.nextQuestionId)
  if (!currentQuestion) {
    console.error(`Question ${engineResult.nextQuestionId} not found in library`)
    return null
  }

  const allCategoryQuestions = getQuestionsForCategory(selectedCategory)
  const answeredCount = Object.keys(answers).length
  const estimatedTotal = allCategoryQuestions.length

  const handleAnswer = (value: string | string[] | 'not_sure') => {
    pushQuestionHistory(currentQuestion.id)
    setAnswer(currentQuestion.id, value)
  }

  const handleBack = () => {
    if (questionHistory.length > 0) {
      const prevQuestionId = popQuestionHistory()
      // Previous question becomes active when answers re-evaluate
      if (prevQuestionId) {
        // Clear answer for current question so engine steps back to previous
        const nextAnswers = { ...answers }
        delete nextAnswers[prevQuestionId]
        delete nextAnswers[currentQuestion.id]
        // Re-evaluate context
        setAnswer(prevQuestionId, undefined as any)
      }
    } else {
      navigate('/app/assess/confirm')
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4 relative min-h-[70vh]">
      
      {/* Holographic "Scanning" Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 flex items-center justify-center">
         {/* Sweeping Scanner Line */}
         <div className="absolute top-0 left-0 right-0 h-1 bg-teal-500/50 shadow-[0_0_15px_rgba(20,184,166,0.8)] animate-[flow-down_3s_linear_infinite]" />
         
         {/* Rotating Diagnostic Rings */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-teal-500/5 rounded-full animate-[spin_30s_linear_infinite] opacity-50" />
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-indigo-500/10 rounded-full animate-[spin_20s_linear_infinite_reverse] opacity-50" />
         
         {/* Background Glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10">
        {/* Numbered Step Progress (Symptoms -> Details -> Results) */}
        <StepIndicator currentStep={2} />

        {/* Pathway Badge */}
        <div className="mb-6 flex items-center justify-between">
          <Badge variant="teal" className="shadow-[0_0_10px_rgba(20,184,166,0.2)]">
            <span className="flex items-center gap-1.5">
               <span className="w-1.5 h-1.5 rounded-full bg-teal-300 animate-pulse" />
               {CATEGORY_TITLES[selectedCategory]}
            </span>
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-wider text-teal-500/80 flex items-center gap-1.5 animate-pulse">
            Diagnostic Engine Active
          </span>
        </div>

        {/* Question Card Component */}
        <div className="relative group">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/10 via-indigo-500/10 to-teal-500/10 rounded-2xl blur opacity-30 group-hover:opacity-50 transition opacity duration-500" />
          
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            currentAnswer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onBack={handleBack}
            canGoBack={true}
            questionIndex={answeredCount + 1}
            totalEstimatedQuestions={estimatedTotal}
          />
        </div>
      </div>
    </div>
  )
}
