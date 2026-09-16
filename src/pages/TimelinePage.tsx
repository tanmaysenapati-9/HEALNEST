import { useState, useEffect, useMemo } from 'react'
import { Clock, Activity, Flame, Stethoscope, ChevronLeft, Calendar, Thermometer, Wind, CircleDot, HeartPulse, User, Compass, Scissors, ShieldAlert, BatteryWarning, TrendingDown, Waves, Droplets, Lock, Droplet, Brain, Zap, Bone, Bug, Eye, Ear, Smile } from 'lucide-react'
import { Card, Badge, Button } from '../components'
import { getTimelineEntries, clearTimeline } from '../store/TimelineStore'
import type { TimelineEntry } from '../store/TimelineStore'
import { AssessResultsPage, OutcomeBadge } from './AssessResultsPage'
import { AssessmentProvider } from '../context/AssessmentContext'

// A wrapper to inject the historic context into AssessResultsPage
function ReadOnlyResultsView({ entry, onBack }: { entry: TimelineEntry; onBack: () => void }) {
  return (
    <div className="animate-fade-in">
      <button
        onClick={onBack}
        className="mb-4 flex items-center text-heal-primary hover:text-heal-primary-hover transition-colors"
      >
        <ChevronLeft size={20} className="mr-1" />
        Back to Timeline
      </button>
      {/* We use a fresh provider initialized with the saved data */}
      <AssessmentProvider>
        <ReadonlyContextInjector entry={entry}>
          <AssessResultsPage />
        </ReadonlyContextInjector>
      </AssessmentProvider>
    </div>
  )
}

import { useAssessment } from '../context/AssessmentContext'

// Helper to inject state into the context we just created
function ReadonlyContextInjector({ entry, children }: { entry: TimelineEntry; children: React.ReactNode }) {
  const { setRawText, setSelectedCategory, setAssessmentResult, setAnswer, setCaregiverContext } = useAssessment()

  useEffect(() => {
    setRawText(entry.structuredContext.freeTextDescription || '')
    setSelectedCategory(entry.category)
    setAssessmentResult(entry.assessmentResult)
    // Fallback to 'Me' for legacy entries that didn't save this field
    setCaregiverContext(entry.caregiverContext ?? 'Me')

    // Inject answers one by one to avoid breaking the context API
    Object.entries(entry.structuredContext.answers).forEach(([key, val]) => {
      setAnswer(key, val)
    })
  }, [entry])

  return <>{children}</>
}


export function TimelinePage() {
  const [entries, setEntries] = useState<TimelineEntry[]>([])
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry | null>(null)

  useEffect(() => {
    setEntries(getTimelineEntries())
  }, [])

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'burn': return <Flame size={20} className="text-orange-500" />
      case 'stomach_pain': return <Activity size={20} className="text-blue-500" />
      case 'headache': return <Activity size={20} className="text-purple-500" />
      case 'fever': return <Thermometer size={20} className="text-red-500" />
      case 'cough': return <Wind size={20} className="text-teal-500" />
      case 'rash': return <CircleDot size={20} className="text-pink-500" />
      case 'chest_pain': return <HeartPulse size={20} className="text-rose-500" />
      case 'back_pain': return <User size={20} className="text-indigo-500" />
      case 'dizziness': return <Compass size={20} className="text-sky-500" />
      case 'cuts': return <Scissors size={20} className="text-red-600" />
      case 'allergic_reaction': return <ShieldAlert size={20} className="text-fuchsia-500" />
      case 'fatigue': return <BatteryWarning size={20} className="text-slate-500" />
      case 'unexplained_weight_loss': return <TrendingDown size={20} className="text-stone-500" />
      case 'nausea_vomiting': return <Waves size={20} className="text-cyan-500" />
      case 'diarrhea': return <Droplets size={20} className="text-emerald-500" />
      case 'constipation': return <Lock size={20} className="text-stone-600" />
      case 'blood_in_stool': return <Droplet size={20} className="text-red-500" />
      case 'numbness_weakness': return <Activity size={20} className="text-violet-500" />
      case 'confusion': return <Brain size={20} className="text-fuchsia-500" />
      case 'seizure': return <Zap size={20} className="text-yellow-500" />
      case 'fainting': return <Activity size={20} className="text-slate-400" />
      case 'joint_pain': return <Bone size={20} className="text-amber-600" />
      case 'muscle_strain': return <Activity size={20} className="text-orange-400" />
      case 'insect_bite': return <Bug size={20} className="text-lime-500" />
      case 'eye_problem': return <Eye size={20} className="text-sky-400" />
      case 'ear_pain': return <Ear size={20} className="text-amber-500" />
      case 'urinary_symptoms': return <Droplet size={20} className="text-yellow-400" />
      case 'mental_health_concern': return <HeartPulse size={20} className="text-indigo-400" />
      case 'toothache_dental_pain': return <Smile size={20} className="text-slate-300" />
      default: return <Activity size={20} className="text-gray-400" />
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'burn': return 'Burn'
      case 'stomach_pain': return 'Stomach Pain'
      case 'headache': return 'Headache'
      case 'fever': return 'Fever'
      case 'cough': return 'Cough'
      case 'rash': return 'Skin Rash'
      case 'chest_pain': return 'Chest Pain'
      case 'back_pain': return 'Back Pain'
      case 'dizziness': return 'Dizziness'
      case 'cuts': return 'Cuts & Wounds'
      case 'allergic_reaction': return 'Allergic Reaction'
      case 'fatigue': return 'Fatigue'
      case 'unexplained_weight_loss': return 'Weight Loss'
      case 'nausea_vomiting': return 'Nausea & Vomiting'
      case 'diarrhea': return 'Diarrhea'
      case 'constipation': return 'Constipation'
      case 'blood_in_stool': return 'Blood in Stool'
      case 'numbness_weakness': return 'Numbness/Weakness'
      case 'confusion': return 'Confusion'
      case 'seizure': return 'Seizure'
      case 'fainting': return 'Fainting'
      case 'joint_pain': return 'Joint Pain'
      case 'muscle_strain': return 'Muscle Strain'
      case 'insect_bite': return 'Insect Bite'
      case 'eye_problem': return 'Eye Problem'
      case 'ear_pain': return 'Ear Pain'
      case 'urinary_symptoms': return 'Urinary Symptoms'
      case 'mental_health_concern': return 'Mental Health'
      case 'toothache_dental_pain': return 'Dental Pain'
      default: return 'Condition'
    }
  }



  // Calculate nudges (e.g. 2+ of same category in last 30 days)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    entries.forEach(e => {
      if (new Date(e.date).getTime() > thirtyDaysAgo) {
        counts[e.category] = (counts[e.category] || 0) + 1
      }
    })
    return counts
  }, [entries])

  const nudgeMessages = Object.entries(categoryCounts)
    .filter(([_, count]) => count >= 2)
    .map(([cat, count]) => `This is your ${count}${count === 2 ? 'nd' : count === 3 ? 'rd' : 'th'} ${getCategoryLabel(cat).toLowerCase()} logged this month.`)

  const handleClearDemoData = () => {
    clearTimeline()
    setEntries([])
  }

  if (selectedEntry) {
    return <ReadOnlyResultsView entry={selectedEntry} onBack={() => setSelectedEntry(null)} />
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-fade-in relative overflow-hidden">
      {/* Ambient background particles for timeline */}
      <div className="absolute top-20 right-0 opacity-10 pointer-events-none animate-float-slow">
        <Activity size={300} className="text-heal-primary" />
      </div>
      <div className="absolute top-1/2 left-0 -translate-x-1/2 opacity-5 pointer-events-none animate-float">
        <Clock size={400} className="text-heal-blue" />
      </div>

      <div className="flex justify-between items-end mb-12 relative z-10">
        <div>
          <Badge variant="teal" className="mb-4 inline-flex items-center">
            <Activity size={12} className="mr-1" /> HEALTH JOURNEY
          </Badge>
          <h1 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading tracking-tight mb-3">
            Your Health <span className="gradient-text">Timeline</span>
          </h1>
          <p className="text-lg dark:text-heal-text-muted text-heal-text-light-muted max-w-lg">
            Track and manage your past symptom checks and health history.
          </p>
        </div>
        {entries.length > 0 && (
          <button onClick={handleClearDemoData} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-heal-bg-elevated/30 border border-heal-border hover:border-heal-primary/50 text-heal-text-light-muted hover:text-heal-primary transition-all backdrop-blur-sm mb-1">
            Clear History
          </button>
        )}
      </div>

      <div className="relative z-10">
        {nudgeMessages.map((msg, idx) => (
          <Card key={idx} glass className="p-4 mb-8 border-heal-primary/30 bg-heal-primary/10 flex items-start overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-heal-primary/20 blur-3xl -translate-y-1/2 translate-x-1/2 rounded-full pointer-events-none" />
            <Calendar className="text-heal-primary mr-3 shrink-0 mt-0.5" size={18} />
            <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted font-medium">{msg}</p>
          </Card>
        ))}

        {entries.length === 0 ? (
          <Card glass className="p-16 text-center flex flex-col items-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-heal-bg-elevated/30 pointer-events-none" />
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-white/5 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10">
              <Clock size={40} className="text-heal-text-muted" />
            </div>
            <h3 className="font-display text-2xl font-bold dark:text-white text-heal-text-light-heading mb-3 tracking-tight">No history yet</h3>
            <p className="dark:text-heal-text-muted text-heal-text-light-muted max-w-sm text-sm leading-relaxed">
              When you complete an assessment, it will be saved here for your records. Start your first symptom check to begin your health journey.
            </p>
          </Card>
        ) : (
          <div className="relative pt-6 pb-12">
            {/* Glowing vertical timeline path */}
            <div className="absolute left-6 md:left-[120px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-heal-border to-transparent" />
            
            {/* Animated flowing energy on the path */}
            <div className="absolute left-6 md:left-[120px] top-0 h-32 w-[2px] bg-gradient-to-b from-transparent via-heal-primary to-transparent animate-[flow-down_4s_ease-in-out_infinite] opacity-50" />

            <div className="space-y-12">
              {entries.map((entry, idx) => {
                const date = new Date(entry.date)
                const formattedDate = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
                const formattedTime = date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

                return (
                  <div key={entry.id} className="relative flex flex-col md:flex-row gap-6 md:gap-12 w-full group">
                    {/* Glowing Node on Timeline */}
                    <div className="absolute left-6 md:left-[120px] top-6 md:top-8 w-3 h-3 rounded-full bg-heal-primary shadow-[0_0_15px_rgba(34,211,238,0.8)] -translate-x-[5px] ring-4 ring-heal-bg group-hover:scale-125 transition-transform duration-300 z-10" />

                    {/* Date/Time Column (Hidden on mobile, inline on desktop) */}
                    <div className="hidden md:flex flex-col shrink-0 min-w-[85px] pt-7 text-right">
                      <span className="font-bold dark:text-white text-heal-text-light-heading text-sm">{formattedDate}</span>
                      <span className="text-xs font-semibold dark:text-heal-text-muted text-heal-text-light-muted uppercase tracking-wider">{formattedTime}</span>
                    </div>

                    {/* Date/Time for Mobile */}
                    <div className="md:hidden flex flex-col shrink-0 pl-14 pt-1">
                      <span className="font-bold dark:text-white text-heal-text-light-heading text-sm">{formattedDate} • {formattedTime}</span>
                    </div>

                    <button onClick={() => setSelectedEntry(entry)} className="w-full text-left flex-1 pl-14 md:pl-0">
                      <Card glass hover className="p-5 md:p-6 flex flex-col gap-4 border dark:border-white/5 border-black/5 group-hover:border-heal-primary/30 group-hover:bg-heal-bg-elevated/80 transition-all duration-300 relative overflow-hidden">
                        {/* Interactive hover sweep */}
                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                           <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                        </div>

                        <div className="relative z-10 flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-heal-bg-elevated to-heal-bg border border-white/5 flex items-center justify-center text-heal-primary shrink-0 shadow-inner group-hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] transition-shadow">
                                {getCategoryIcon(entry.category)}
                              </div>
                              <div>
                                <h4 className="font-display font-bold text-lg dark:text-white text-heal-text-light-heading group-hover:text-heal-primary transition-colors">{getCategoryLabel(entry.category)}</h4>
                                {entry.caregiverContext && (
                                  <span className="text-xs font-medium dark:text-heal-text-muted text-heal-text-light-muted flex items-center gap-1">
                                    <User size={10} /> {entry.caregiverContext}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="hidden sm:block">
                              <OutcomeBadge outcome={entry.outcome} />
                            </div>
                          </div>
                          
                          <div className="sm:hidden mb-1">
                             <OutcomeBadge outcome={entry.outcome} />
                          </div>

                          <div className="p-3.5 rounded-lg bg-black/20 dark:bg-black/30 border border-white/5">
                            <p className="text-sm font-medium dark:text-slate-300 text-slate-700 italic line-clamp-2 leading-relaxed">
                              "{entry.briefDescription}"
                            </p>
                          </div>
                          
                          <div className="text-xs font-semibold text-heal-primary flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0 duration-300">
                             View Details <ChevronLeft size={14} className="rotate-180" />
                          </div>
                        </div>
                      </Card>
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
