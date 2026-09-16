import { useEffect, useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertOctagon,
  AlertTriangle,
  Activity,
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldCheck,
  PhoneCall,
  Sparkles,
  Info
} from 'lucide-react'
import { Card, Button, StepIndicator, Disclaimer, Badge } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import { runEngine } from '../engine/pathwayEngine'
import { getCarePathwayTemplate } from '../engine/carePathways'
import type { AssessmentOutcome } from '../engine/types'
import { explainCarePathway } from '../ai/explainResult'
import type { ExplainedPathway } from '../ai/serverExplanation'
import { useLanguage } from '../i18n/LanguageContext'
import { saveTimelineEntry } from '../store/TimelineStore'

// PART 5: safety engine wiring + AI explanation renders full results here

export const outcomeConfig: Record<
  AssessmentOutcome,
  {
    label: string
    bgClass: string
    borderClass: string
    textClass: string
    icon: typeof AlertOctagon
    description: string
  }
> = {
  urgent: {
    label: 'Emergency / Urgent Care Required',
    bgClass: 'bg-red-500/15',
    borderClass: 'border-red-500/30',
    textClass: 'text-red-400',
    icon: AlertOctagon,
    description: 'Critical clinical red flags detected. Seek immediate emergency evaluation.',
  },
  see_doctor: {
    label: 'Medical Evaluation Recommended',
    bgClass: 'bg-amber-500/15',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    icon: AlertTriangle,
    description: 'Consult a primary care doctor, urgent care, or telehealth provider within 24–48 hours.',
  },
  monitor: {
    label: 'Active Monitoring at Home',
    bgClass: 'bg-cyan-500/15',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
    icon: Activity,
    description: 'Monitor symptoms for the next 12 to 24 hours. Re-assess if pain worsens or new symptoms appear.',
  },
  self_care: {
    label: 'Self-Care at Home',
    bgClass: 'bg-emerald-500/15',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400',
    icon: CheckCircle2,
    description: 'Your symptoms match mild, low-risk criteria suitable for home first-aid and rest.',
  },
}

export function OutcomeBadge({ outcome }: { outcome: string }) {
  // Graceful fallback for demo seed data or corrupted localstorage
  const validOutcome = (outcome === 'routine' ? 'self_care' : outcome === 'consult' ? 'see_doctor' : outcome) as AssessmentOutcome
  
  const config = outcomeConfig[validOutcome]
  if (!config) return <Badge variant="blue">Unknown</Badge>

  // Map Tailwind color prefixes from AssessResultsPage (red, amber, cyan, emerald) 
  // to the matching Badge variant (red, amber, blue, teal)
  const variantMap: Record<string, 'red'|'amber'|'blue'|'teal'> = {
    'bg-red-500/15': 'red',
    'bg-amber-500/15': 'amber',
    'bg-cyan-500/15': 'blue',
    'bg-emerald-500/15': 'teal'
  }
  
  const badgeVariant = variantMap[config.bgClass] || 'blue'

  return <Badge variant={badgeVariant}>{config.label}</Badge>
}

export function AssessResultsPage() {
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const {
    assessmentId,
    caregiverContext,
    structuredContext,
    selectedCategory,
    assessmentResult,
    setAssessmentResult,
    resetAssessment,
  } = useAssessment()

  const [explainedPathway, setExplainedPathway] = useState<ExplainedPathway | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const savedAssessmentIdRef = useRef<string | null>(null)

  // Graceful redirection if someone lands directly with no assessment
  useEffect(() => {
    if (!structuredContext && !assessmentResult) {
      navigate('/app/assess/start', { replace: true })
    }
  }, [structuredContext, assessmentResult, navigate])

  // Derive result from state or run engine if not yet stored
  const result =
    assessmentResult ||
    (structuredContext ? runEngine(structuredContext) : null)

  useEffect(() => {
    if (result && !assessmentResult) {
      setAssessmentResult(result)
    }
  }, [result, assessmentResult, setAssessmentResult])

  useEffect(() => {
    if (result && structuredContext && selectedCategory && savedAssessmentIdRef.current !== assessmentId) {
      savedAssessmentIdRef.current = assessmentId
      // Feature 1: Automatically save to timeline
      saveTimelineEntry({
        id: assessmentId,
        date: new Date().toISOString(),
        category: selectedCategory,
        outcome: result.outcome,
        briefDescription: structuredContext.freeTextDescription || 'Symptom assessment',
        structuredContext,
        assessmentResult: result,
        caregiverContext,
      })
    }
  }, [result, structuredContext, selectedCategory, assessmentId, caregiverContext])

  // Memoize careTemplate so its reference is stable across renders
  const careTemplate = useMemo(() => {
    return result ? getCarePathwayTemplate(result.outcome, selectedCategory || undefined) : null
  }, [result?.outcome, selectedCategory])

  const hasCalledAiRef = useRef<string | null>(null)

  // 1. Right when the results screen mounts: log data received from Part 4
  useEffect(() => {
    console.log('[HEALNEST DEBUG] Results Screen Mounted')
    console.log('[HEALNEST DEBUG] AssessmentResult:', result)
    console.log('[HEALNEST DEBUG] carePathway Template:', careTemplate)
  }, []) // run once on mount

  useEffect(() => {
    let mounted = true

    // Guard condition: if missing data, or we ALREADY called the AI for this specific reason, skip.
    // This strictly prevents any infinite loops caused by re-renders.
    if (!result || !careTemplate) return
    const callKey = `${assessmentId}:${result.reason}`
    if (hasCalledAiRef.current === callKey) return

    setAiLoading(true)
    hasCalledAiRef.current = callKey
    
    // 2. Right before the AI call is made
    console.log('[HEALNEST DEBUG] Starting AI explanation call...')
    
    explainCarePathway(result.outcome, result.reason, careTemplate, language, caregiverContext)
      .then((explanation) => {
        // 3. Right after AI call resolves
        console.log('[HEALNEST DEBUG] AI Call Resolved:', explanation)
        if (mounted) {
          setExplainedPathway(explanation)
          setAiLoading(false)
        }
      })
      .catch((error) => {
        // 3. Right after AI call rejects
        console.error('[HEALNEST DEBUG] AI Call Rejected with Error:', error)
        if (mounted) setAiLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [result?.outcome, result?.reason, careTemplate]) // Safe dependencies now that careTemplate is memoized

  if (!result || !careTemplate) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <Card glass className="p-8 space-y-4">
          <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted">
            No active assessment result found. Please complete the symptom questions.
          </p>
          <Button variant="primary" onClick={() => navigate('/app/assess/start')}>
            {t('btn.startAssessment')}
          </Button>
        </Card>
      </div>
    )
  }


  const config = outcomeConfig[result.outcome]
  const OutcomeIcon = config.icon

  const confidencePercentage = {
    high: 85,
    medium: 60,
    low: 35,
  }[result.confidence] || 50

  const handleStartNew = () => {
    resetAssessment()
    navigate('/app/assess/who')
  }

  const displayPathway = explainedPathway || careTemplate

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in relative">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 space-y-6">
        {/* Progress step indicator — Step 3: Guidance */}
        <StepIndicator currentStep={3} />

        {/* URGENT BANNER: Shown immediately on urgent outcome before anything else */}
        {result.outcome === 'urgent' && (
          <div className="p-5 rounded-2xl bg-red-600 border-2 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.6)] text-white space-y-3 animate-pulse-fast relative overflow-hidden">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(255,255,255,0.1)_10px,rgba(255,255,255,0.1)_20px)] opacity-20 pointer-events-none" />
            <div className="relative z-10 flex items-center gap-4 font-bold text-xl sm:text-2xl">
              <div className="bg-white text-red-600 p-2 rounded-xl shadow-lg">
                <AlertOctagon size={28} />
              </div>
              <span>Immediate Medical Attention Required</span>
            </div>
            <p className="text-sm sm:text-base font-medium text-red-50 ml-[60px] relative z-10">
              Please contact emergency services (e.g., 911) or proceed immediately to the nearest Emergency Department. Do not delay.
            </p>
          </div>
        )}

        {/* Assessment Output Verification Banner */}
        <div className="p-4 rounded-xl dark:bg-heal-bg-elevated/90 bg-white border border-heal-teal/40 text-sm shadow-sm flex items-start gap-3 backdrop-blur-md">
          <Info size={18} className="text-heal-teal mt-0.5 shrink-0" />
          <p className="dark:text-slate-200 text-slate-800 leading-relaxed">
            <span className="font-bold text-heal-teal">This is not a medical diagnosis.</span>{' '}
            If symptoms persist, worsen, or cause you concern, please consult a qualified healthcare professional.
          </p>
        </div>

        {/* Primary Outcome Banner Card */}
        <Card
          glass
          className={`p-6 sm:p-10 border-2 ${config.borderClass} ${config.bgClass.replace('/15', '/10')} relative overflow-hidden group`}
          style={{
            boxShadow: result.outcome === 'urgent' 
              ? '0 0 50px rgba(239,68,68,0.25), inset 0 0 20px rgba(239,68,68,0.1)'
              : result.outcome === 'see_doctor'
              ? '0 0 50px rgba(245,158,11,0.25), inset 0 0 20px rgba(245,158,11,0.1)'
              : result.outcome === 'monitor'
              ? '0 0 50px rgba(6,182,212,0.25), inset 0 0 20px rgba(6,182,212,0.1)'
              : '0 0 50px rgba(16,185,129,0.25), inset 0 0 20px rgba(16,185,129,0.1)'
          }}
        >
          {/* Animated Sweeping Line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${config.bgClass.replace('/15', '')} shadow-[0_0_15px_${config.textClass.replace('text-', 'rgba(')}] animate-[flow-down_3s_ease-in-out_infinite]`} />
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-5">
              <div
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-[0_0_30px_rgba(0,0,0,0.2)] ${
                  result.outcome === 'urgent'
                    ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                    : result.outcome === 'see_doctor'
                    ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white'
                    : result.outcome === 'monitor'
                    ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 text-white'
                    : 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white'
                }`}
              >
                <OutcomeIcon size={36} className="drop-shadow-md" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/20 backdrop-blur-sm border ${config.borderClass} ${config.textClass}`}>
                    {t('label.triageLevel')}
                  </span>
                  <div className="flex items-center gap-2 border-l border-white/20 pl-3">
                    <span className="text-[10px] uppercase font-bold dark:text-white/50 text-black/50">{t('label.confidence')}</span>
                    <div className="w-20 h-2 bg-black/20 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className={`h-full ${config.bgClass.replace('/15', '')} brightness-150 rounded-full relative`} 
                        style={{ width: `${confidencePercentage}%` }} 
                      >
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase ${config.textClass}`}>{result.confidence}</span>
                  </div>
                </div>
                <h1 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading tracking-tight mb-2">
                  {config.label}
                </h1>
                <p className="text-base font-medium dark:text-slate-300 text-slate-700 leading-relaxed">
                  {config.description}
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Callout if Urgent */}
          {result.outcome === 'urgent' && (
            <div className="mt-8 p-5 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-between gap-4 backdrop-blur-md relative overflow-hidden group/call">
              <div className="absolute inset-0 bg-red-500/10 -translate-x-full group-hover/call:animate-[shine_1.5s_ease-in-out_infinite] skew-x-12" />
              <div className="flex items-center gap-3 text-red-200 relative z-10">
                <div className="p-2.5 bg-red-500/20 rounded-lg text-red-400">
                  <PhoneCall size={24} />
                </div>
                <span className="font-semibold text-lg">Call emergency services immediately.</span>
              </div>
            </div>
          )}
        </Card>

        {/* Clinical Rationale from Rule Engine */}
        <Card glass className="p-6 sm:p-8 space-y-5 border-white/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-heal-primary/10 blur-[40px] pointer-events-none rounded-full" />
          
          <div className="flex items-center gap-3 text-heal-teal relative z-10">
            <div className="p-2 bg-heal-teal/10 rounded-lg border border-heal-teal/20">
              <ShieldCheck size={20} />
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl dark:text-white text-heal-text-light-heading">
              Clinical Assessment Summary
            </h2>
          </div>

          <div className="p-5 rounded-xl dark:bg-heal-bg-elevated/80 bg-slate-100 border border-white/5 shadow-inner text-sm sm:text-base leading-relaxed relative z-10">
            <p className="dark:text-slate-200 text-slate-800 font-medium">
              {result.reason}
            </p>
          </div>

          {/* Triggered Red Flags List if any */}
          {result.triggeredRedFlags.length > 0 && (
            <div className="space-y-3 pt-3 relative z-10">
              <span className="text-xs font-bold uppercase tracking-wider text-red-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Triggered Safety Rules
              </span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {result.triggeredRedFlags.map((flagId) => (
                  <li
                    key={flagId}
                    className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 font-mono shadow-sm"
                  >
                    <AlertOctagon size={16} className="text-red-400 flex-shrink-0" />
                    <span className="font-semibold">{flagId}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        {/* Structured Care Pathway Guidance */}
        <Card glass className="p-6 sm:p-8 space-y-8 border-white/5 shadow-xl relative overflow-hidden">
          <div className="flex items-start justify-between relative z-10">
            <div>
              <h2 className="font-display font-bold text-xl sm:text-2xl dark:text-white text-heal-text-light-heading mb-2 flex items-center gap-2">
                {t('heading.recommendedActions')}
              </h2>
              <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted flex items-center gap-2">
                {explainedPathway 
                  ? <><Sparkles size={14} className="text-heal-primary" /> Personalized clinical recommendations</>
                  : <><ShieldCheck size={14} className="text-slate-400" /> Direct clinical recommendations from HEALNEST protocols</>}
              </p>
            </div>
            {aiLoading && (
              <div className="flex items-center gap-2 text-xs text-heal-text-muted bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                <RefreshCw size={12} className="animate-spin" />
                <span>Personalizing recommendations...</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            {/* What to do now */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-heal-teal flex items-center gap-2 bg-heal-teal/10 w-fit px-3 py-1.5 rounded-lg border border-heal-teal/20">
                <Clock size={16} /> {t('label.whatToDoNow')}
              </h3>
              <ul className="space-y-3">
                {displayPathway.whatToDoNow.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl dark:bg-white/5 bg-slate-50 border border-white/10 dark:hover:border-heal-teal/40 transition-colors shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-heal-teal/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-heal-teal" />
                    </div>
                    <span className="dark:text-slate-200 text-slate-800 leading-relaxed font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to monitor */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-heal-blue flex items-center gap-2 bg-heal-blue/10 w-fit px-3 py-1.5 rounded-lg border border-heal-blue/20">
                <Activity size={16} /> {t('label.whatToMonitor')}
              </h3>
              <ul className="space-y-3">
                {displayPathway.whatToMonitor.map((bullet, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-4 rounded-xl dark:bg-white/5 bg-slate-50 border border-white/10 dark:hover:border-heal-blue/40 transition-colors shadow-sm"
                  >
                    <div className="w-6 h-6 rounded-full bg-heal-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-heal-blue" />
                    </div>
                    <span className="dark:text-slate-200 text-slate-800 leading-relaxed font-medium">{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* When to seek immediate care */}
          <div className="space-y-4 relative z-10 pt-2 border-t border-white/10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 bg-amber-400/10 w-fit px-3 py-1.5 rounded-lg border border-amber-400/20">
              <AlertTriangle size={16} /> {t('label.whenToSeekCare')}
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {displayPathway.whenToSeekImmediateCare.map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 p-4 rounded-xl dark:bg-amber-500/5 bg-amber-50/50 border border-amber-500/20 dark:hover:border-amber-400/50 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                  </div>
                  <span className="dark:text-amber-200 text-amber-900 leading-relaxed font-medium">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-heal-border flex flex-col sm:flex-row justify-end gap-4 mt-8 relative z-10">
            {/* PART 6: doctor-ready summary + multilingual builds here */}
            <Button
              variant="primary"
              size="lg"
              className="font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_25px_rgba(20,184,166,0.5)]"
              onClick={() => navigate('/app/assess/summary')}
            >
              {t('btn.generateSummary')}
            </Button>
            <Button
              variant="outline"
              size="lg"
              icon={<RefreshCw size={18} />}
              iconPosition="left"
              className="font-bold border-white/20 hover:border-white/40"
              onClick={handleStartNew}
            >
              {t('btn.startNewCheck')}
            </Button>
          </div>
        </Card>
        <Disclaimer />
      </div>
    </div>
  )
}
