import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CheckCircle2, Flame, Stethoscope, Sparkles, HelpCircle, Thermometer, Wind, CircleDot, HeartPulse, User, Compass, Scissors, ShieldAlert, BatteryWarning, TrendingDown, Waves, Droplets, Lock, Droplet, Brain, Zap, Bone, Bug, Eye, Ear, Smile, Activity } from 'lucide-react'
import { Card, Button, Badge } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import type { SymptomCategory } from '../engine/types'

export function AssessConfirmPage() {
  const navigate = useNavigate()
  const {
    rawText,
    extractionResult,
    selectedCategory,
    setSelectedCategory,
  } = useAssessment()

  // Category display details
  const categoryMetadata: Record<
    SymptomCategory,
    { label: string; icon: any; color: string }
  > = {
    burn: {
      label: 'Burn or Scald',
      icon: Flame,
      color: 'from-amber-500 to-orange-600',
    },
    stomach_pain: {
      label: 'Stomach Pain',
      icon: Stethoscope,
      color: 'from-emerald-500 to-teal-600',
    },
    headache: {
      label: 'Headache',
      icon: Sparkles,
      color: 'from-blue-500 to-indigo-600',
    },
    fever: {
      label: 'Fever',
      icon: Thermometer,
      color: 'from-red-500 to-rose-600',
    },
    cough: {
      label: 'Cough',
      icon: Wind,
      color: 'from-sky-500 to-cyan-600',
    },
    rash: {
      label: 'Rash',
      icon: CircleDot,
      color: 'from-pink-500 to-fuchsia-600',
    },
    chest_pain: {
      label: 'Chest Pain',
      icon: HeartPulse,
      color: 'from-red-600 to-orange-700',
    },
    back_pain: {
      label: 'Back Pain',
      icon: User,
      color: 'from-violet-500 to-purple-600',
    },
    dizziness: {
      label: 'Dizziness',
      icon: Compass,
      color: 'from-indigo-400 to-blue-500',
    },
    cuts: {
      label: 'Cuts & Wounds',
      icon: Scissors,
      color: 'from-rose-500 to-red-600',
    },
    allergic_reaction: {
      label: 'Allergic Reaction',
      icon: ShieldAlert,
      color: 'from-fuchsia-500 to-pink-600',
    },
    fatigue: {
      label: 'Fatigue',
      icon: BatteryWarning,
      color: 'from-slate-400 to-gray-600',
    },
    unexplained_weight_loss: {
      label: 'Weight Loss',
      icon: TrendingDown,
      color: 'from-stone-400 to-neutral-600',
    },
    nausea_vomiting: {
      label: 'Nausea & Vomiting',
      icon: Waves,
      color: 'from-cyan-500 to-teal-600',
    },
    diarrhea: {
      label: 'Diarrhea',
      icon: Droplets,
      color: 'from-emerald-400 to-teal-500',
    },
    constipation: {
      label: 'Constipation',
      icon: Lock,
      color: 'from-stone-500 to-stone-700',
    },
blood_in_stool: {
      label: 'Blood in Stool',
      icon: Droplet,
      color: 'from-red-600 to-red-800',
    },
    numbness_weakness: { label: 'Numbness', icon: Activity, color: 'from-violet-500 to-purple-600' },
    confusion: { label: 'Confusion', icon: Brain, color: 'from-fuchsia-500 to-purple-500' },
    seizure: { label: 'Seizure', icon: Zap, color: 'from-yellow-400 to-yellow-600' },
    fainting: { label: 'Fainting', icon: Activity, color: 'from-slate-400 to-gray-500' },
    joint_pain: { label: 'Joint Pain', icon: Bone, color: 'from-amber-500 to-orange-500' },
    muscle_strain: { label: 'Muscle Strain', icon: Activity, color: 'from-orange-400 to-red-400' },
    insect_bite: { label: 'Insect Bite', icon: Bug, color: 'from-lime-500 to-green-600' },
    eye_problem: { label: 'Eye Problem', icon: Eye, color: 'from-sky-400 to-blue-500' },
    ear_pain: { label: 'Ear Pain', icon: Ear, color: 'from-amber-400 to-yellow-500' },
    urinary_symptoms: { label: 'Urinary', icon: Droplet, color: 'from-yellow-300 to-amber-500' },
    mental_health_concern: { label: 'Mental Health', icon: HeartPulse, color: 'from-indigo-400 to-indigo-600' },
    toothache_dental_pain: { label: 'Dental Pain', icon: Smile, color: 'from-slate-300 to-gray-400' },
  }

  const handleSelectCategory = (cat: SymptomCategory) => {
    setSelectedCategory(cat)
  }

  const handleContinue = () => {
    if (!selectedCategory) return
    // Navigate to Part 4 adaptive question flow
    navigate('/app/assess/questions')
  }

  const handleEdit = () => {
    // Preserve text and navigate back to input
    navigate('/app/assess/start')
  }

  const isUnrecognized = !selectedCategory || extractionResult?.category === 'unrecognized'

  return (
    <div className="max-w-2xl mx-auto py-4 px-2 sm:px-4 animate-fade-in">
      {/* Top context badge */}
      <div className="mb-4">
        <Badge variant="teal">
          <CheckCircle2 size={12} className="mr-1 text-heal-teal" />
          STEP 2 OF 3 · CONFIRM CATEGORY
        </Badge>
      </div>

      <Card glass className="p-6 sm:p-8 space-y-6 overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute top-10 -right-20 opacity-5 pointer-events-none -rotate-12">
          <HeartPulse size={300} className="text-white" />
        </div>
        
        <div className="relative z-10">
          <h1 className="font-display text-2xl sm:text-3xl font-bold dark:text-white text-heal-text-light-heading mb-2 tracking-tight">
            Confirm Your Assessment
          </h1>
          <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted">
            Please verify what we understood from your description before we proceed.
          </p>

        {/* "We heard: {originalText}" (Spec Section 5) */}
        <div className="p-4 rounded-xl dark:bg-heal-bg-elevated/70 bg-slate-100/80 border border-heal-border">
          <p className="text-xs font-semibold uppercase tracking-wider text-heal-text-muted mb-1.5">
            We Heard:
          </p>
          <p className="text-sm dark:text-slate-100 text-slate-800 italic leading-relaxed">
            "{rawText || extractionResult?.originalText || 'No description provided'}"
          </p>
        </div>

        {/* Detected Category or Unrecognized Banner */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-heal-text-muted mb-2.5">
            Pathway Classification
          </p>

          {!isUnrecognized && selectedCategory && (
            <div className="p-4 rounded-xl dark:bg-heal-bg-elevated/40 bg-white border border-heal-teal/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-r ${categoryMetadata[selectedCategory].color} flex items-center justify-center text-white shadow-md`}
                >
                  {categoryMetadata[selectedCategory] && (() => {
                    const Icon = categoryMetadata[selectedCategory].icon
                    return <Icon size={20} />
                  })()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-heal-teal uppercase tracking-wider">
                      Detected Pathway
                    </span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-heal-text-muted">
                      {extractionResult?.confidence ? `${extractionResult.confidence} confidence` : 'verified'}
                    </span>
                  </div>
                  <p className="text-base font-bold dark:text-white text-heal-text-light-heading">
                    {categoryMetadata[selectedCategory].label}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCategory(null as any)}
                className="text-xs text-heal-blue hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* If Unrecognized or user wishes to change — Manual Selector */}
          {(isUnrecognized || !selectedCategory) && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-2.5">
                <HelpCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs dark:text-amber-200 text-amber-900 leading-relaxed">
                  We're not sure which category this fits best. Please select your primary symptom
                  below to continue:
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {(['burn', 'stomach_pain', 'headache', 'fever', 'cough', 'rash', 'chest_pain', 'back_pain', 'dizziness', 'cuts', 'allergic_reaction', 'fatigue', 'unexplained_weight_loss', 'nausea_vomiting', 'diarrhea', 'constipation', 'blood_in_stool', 'numbness_weakness', 'confusion', 'seizure', 'fainting', 'joint_pain', 'muscle_strain', 'insect_bite', 'eye_problem', 'ear_pain', 'urinary_symptoms', 'mental_health_concern', 'toothache_dental_pain'] as const).map((cat) => {
                  const meta = categoryMetadata[cat]
                  const isSelected = selectedCategory === cat
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleSelectCategory(cat)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                        isSelected
                          ? 'border-heal-teal bg-heal-teal/10 shadow-[0_0_20px_rgba(34,211,238,0.2)] ring-1 ring-heal-teal/40 scale-[1.02]'
                          : 'border-heal-border dark:bg-heal-bg-elevated/40 bg-white hover:border-heal-teal/50 hover:bg-heal-bg-elevated/60 hover:shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg bg-gradient-to-r ${meta.color} flex items-center justify-center text-white`}
                        >
                          {(() => {
                            const Icon = meta.icon
                            return <Icon size={16} />
                          })()}
                        </div>
                        {isSelected && <CheckCircle2 size={16} className="text-heal-teal" />}
                      </div>
                      <span className="text-sm font-semibold dark:text-white text-heal-text-light-heading">
                        {meta.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Extracted Details Pill Display (if any extracted) */}
        {extractionResult?.extractedFields &&
          Object.values(extractionResult.extractedFields).some((v) => Boolean(v)) && (
            <div className="p-4 rounded-xl dark:bg-heal-bg-elevated/30 bg-slate-50 border border-heal-border space-y-2 text-xs">
              <p className="font-semibold uppercase tracking-wider text-heal-text-muted">
                Extracted Observations
              </p>
              <div className="flex flex-wrap gap-2">
                {extractionResult.extractedFields.bodyArea && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 dark:text-heal-text text-heal-text-light">
                    Area: <strong>{extractionResult.extractedFields.bodyArea}</strong>
                  </span>
                )}
                {extractionResult.extractedFields.cause && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 dark:text-heal-text text-heal-text-light">
                    Cause: <strong>{extractionResult.extractedFields.cause}</strong>
                  </span>
                )}
                {extractionResult.extractedFields.approximateDuration && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 dark:text-heal-text text-heal-text-light">
                    Duration: <strong>{extractionResult.extractedFields.approximateDuration}</strong>
                  </span>
                )}
                {extractionResult.extractedFields.otherMentionedSymptoms?.map((sym, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 dark:text-heal-text text-heal-text-light"
                  >
                    Noted: <strong>{sym}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Action Buttons: Edit (Back) & Continue */}
        <div className="pt-4 border-t border-heal-border flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            onClick={handleEdit}
          >
            Edit Description
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<ArrowRight size={16} />}
            disabled={!selectedCategory}
            onClick={handleContinue}
            className={!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}
          >
            Continue
          </Button>
        </div>
        </div>
      </Card>
    </div>
  )
}
