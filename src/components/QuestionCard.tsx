import { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react'
import type { Question, Option } from '../engine/types'
import { Card } from './Card'
import { Button } from './Button'

interface QuestionCardProps {
  question: Question
  currentAnswer?: string | string[] | 'not_sure'
  onAnswer: (value: string | string[] | 'not_sure') => void
  onBack?: () => void
  canGoBack?: boolean
  questionIndex?: number
  totalEstimatedQuestions?: number
}

export function QuestionCard({
  question,
  currentAnswer,
  onAnswer,
  onBack,
  canGoBack = false,
  questionIndex = 1,
  totalEstimatedQuestions = 5,
}: QuestionCardProps) {
  const [showWhy, setShowWhy] = useState(false)

  // Local state for multi-select questions
  const initialMulti = Array.isArray(currentAnswer)
    ? currentAnswer
    : currentAnswer && currentAnswer !== 'not_sure'
    ? [currentAnswer]
    : []
  const [selectedMulti, setSelectedMulti] = useState<string[]>(initialMulti)

  // Separate regular options from "Not sure"
  const notSureOption = question.options.find((o) => o.id === 'not_sure')
  const regularOptions = question.options.filter((o) => o.id !== 'not_sure')

  const handleSingleSelect = (option: Option) => {
    onAnswer(option.value)
  }

  const handleToggleMulti = (option: Option) => {
    if (option.id === 'none') {
      setSelectedMulti(['none'])
      return
    }

    const withoutNone = selectedMulti.filter((v) => v !== 'none')
    if (withoutNone.includes(option.value)) {
      setSelectedMulti(withoutNone.filter((v) => v !== option.value))
    } else {
      setSelectedMulti([...withoutNone, option.value])
    }
  }

  const handleConfirmMulti = () => {
    if (selectedMulti.length === 0) return
    onAnswer(selectedMulti)
  }

  const handleSelectNotSure = () => {
    onAnswer('not_sure')
  }

  return (
    <Card glass className="p-6 sm:p-8 space-y-6 animate-fade-in relative">
      {/* Progress header & Question Counter */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <span className="text-xs font-semibold tracking-wider uppercase text-heal-teal">
          Question {questionIndex} of ~{totalEstimatedQuestions}
        </span>
        {question.multiSelect && (
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-heal-blue/15 text-heal-blue border border-heal-blue/30 font-medium">
            Select all that apply
          </span>
        )}
      </div>

      {/* Question Headline & "Why?" link */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-2">
          <h2 className="font-display text-xl sm:text-2xl font-bold dark:text-white text-heal-text-light-heading tracking-tight leading-snug">
            {question.text}
          </h2>

          {/* "Why are you asking this?" button (Spec Section 20) */}
          {question.whyText && (
            <button
              type="button"
              onClick={() => setShowWhy(!showWhy)}
              className="flex items-center gap-1 text-xs text-heal-blue hover:text-heal-blue-light transition-colors py-1 px-2 rounded-lg hover:bg-heal-blue/10 flex-shrink-0 cursor-pointer select-none"
              title="Learn why this question is medically relevant"
              aria-expanded={showWhy}
            >
              <HelpCircle size={14} />
              <span className="font-medium hidden sm:inline">Why?</span>
              {showWhy ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {question.subtext && (
          <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
            {question.subtext}
          </p>
        )}

        {/* Expandable "Why are you asking this?" static clinical explanation */}
        {showWhy && question.whyText && (
          <div className="mt-3 p-3.5 rounded-xl bg-heal-blue/10 border border-heal-blue/20 text-xs dark:text-slate-200 text-slate-800 animate-slide-up flex items-start gap-2.5">
            <HelpCircle size={16} className="text-heal-blue flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-heal-blue block">Clinical Purpose:</span>
              <p className="leading-relaxed">{question.whyText}</p>
            </div>
          </div>
        )}
      </div>

      {/* Options Grid (MCQ Tile style matching reference) */}
      <div className="space-y-3">
        {regularOptions.map((option) => {
          const isSelected = question.multiSelect
            ? selectedMulti.includes(option.value)
            : currentAnswer === option.value

          return (
            <button
              key={option.id}
              type="button"
              onClick={() =>
                question.multiSelect
                  ? handleToggleMulti(option)
                  : handleSingleSelect(option)
              }
              className={`
                relative w-full text-left p-4 rounded-xl transition-all duration-300 cursor-pointer
                flex items-center justify-between group overflow-hidden
                ${
                  isSelected
                    ? 'dark:bg-teal-500/10 bg-teal-50 border-2 border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.2)] scale-[1.01]'
                    : 'dark:bg-heal-bg-elevated/50 bg-white/80 border border-white/10 dark:border-white/5 hover:border-teal-500/40 hover:bg-white/5 hover:shadow-[0_0_15px_rgba(20,184,166,0.1)]'
                }
              `}
            >
              {isSelected && (
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/10 to-teal-500/0 animate-[shine_2s_ease-in-out_infinite] skew-x-12" />
              )}
              
              <div className="flex items-center gap-4 relative z-10">
                {/* Radio/Checkbox indicator */}
                <div
                  className={`
                    w-6 h-6 rounded-${question.multiSelect ? 'md' : 'full'} flex items-center justify-center
                    border-2 transition-all duration-300 shadow-inner
                    ${
                      isSelected
                        ? 'bg-teal-500 border-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.5)]'
                        : 'border-white/20 dark:bg-black/40 bg-slate-100 group-hover:border-teal-500/50 group-hover:bg-white/5'
                    }
                  `}
                >
                  {isSelected && <Check size={14} strokeWidth={3} className="text-white" />}
                </div>

                <span
                  className={`text-sm sm:text-base font-medium transition-colors duration-300 ${
                    isSelected
                      ? 'dark:text-white text-teal-900 font-bold'
                      : 'dark:text-slate-300 text-slate-700 group-hover:text-white'
                  }`}
                >
                  {option.label}
                </span>
              </div>
            </button>
          )
        })}

        {/* Distinct, de-emphasized "Not sure" option */}
        {notSureOption && (
          <div className="pt-2">
            <button
              type="button"
              onClick={handleSelectNotSure}
              className={`
                w-full text-center py-2.5 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 cursor-pointer
                border border-dashed
                ${
                  currentAnswer === 'not_sure'
                    ? 'border-heal-teal bg-heal-teal/10 text-heal-teal font-semibold'
                    : 'border-white/15 dark:text-heal-text-muted text-heal-text-light-muted hover:border-white/30 hover:bg-white/5'
                }
              `}
            >
              {notSureOption.label} — <span className="opacity-75">I'm not completely certain</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="pt-4 border-t border-heal-border flex items-center justify-between gap-3">
        {canGoBack && onBack ? (
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowLeft size={15} />}
            iconPosition="left"
            onClick={onBack}
          >
            Back
          </Button>
        ) : (
          <div />
        )}

        {question.multiSelect && (
          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            disabled={selectedMulti.length === 0}
            onClick={handleConfirmMulti}
            className={selectedMulti.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Continue
          </Button>
        )}
      </div>
    </Card>
  )
}
