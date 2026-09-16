import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ClipboardCopy, ArrowLeft, RefreshCw, FileText, Sparkles } from 'lucide-react'
import { Card, Button, Disclaimer } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import { useLanguage } from '../i18n/LanguageContext'
import { OutcomeBadge } from './AssessResultsPage'
import { formatSummary } from '../ai/formatSummary'

export function AssessSummaryPage() {
  const navigate = useNavigate()
  const { caregiverContext, structuredContext, assessmentResult, resetAssessment } = useAssessment()
  const { t } = useLanguage()

  const [aiSummary, setAiSummary] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!structuredContext || !assessmentResult) {
      navigate('/app/assess/start', { replace: true })
    }
  }, [structuredContext, assessmentResult, navigate])

  useEffect(() => {
    let mounted = true
    if (structuredContext && assessmentResult) {
      setIsAiLoading(true)
      formatSummary(structuredContext, assessmentResult, undefined, caregiverContext)
        .then((summary) => {
          if (mounted && summary) setAiSummary(summary)
        })
        .catch(console.error)
        .finally(() => {
          if (mounted) setIsAiLoading(false)
        })
    }
    return () => {
      mounted = false
    }
  }, [structuredContext, assessmentResult])

  if (!structuredContext || !assessmentResult) return null

  // Map every SymptomCategory to a human-readable label from the FINAL detected category
  // This ensures the summary always reflects the ACTUAL assessed concern, never a stale default.
  const CATEGORY_LABELS: Record<string, string> = {
    burn: 'Burn / Injury',
    stomach_pain: 'Stomach / Digestive Pain',
    headache: 'Headache',
    fever: 'Fever',
    cough: 'Cough / Respiratory',
    rash: 'Rash / Skin Condition',
    chest_pain: 'Chest Pain',
    back_pain: 'Back Pain',
    dizziness: 'Dizziness / Balance',
    cuts: 'Cut / Wound',
    allergic_reaction: 'Allergic Reaction',
    fatigue: 'Fatigue / Low Energy',
    unexplained_weight_loss: 'Unexplained Weight Loss',
    nausea_vomiting: 'Nausea / Vomiting',
    diarrhea: 'Diarrhea',
    constipation: 'Constipation',
    blood_in_stool: 'Blood in Stool',
    numbness_weakness: 'Numbness / Weakness',
    confusion: 'Confusion / Disorientation',
    seizure: 'Seizure',
    fainting: 'Fainting / Loss of Consciousness',
    joint_pain: 'Joint Pain',
    muscle_strain: 'Muscle Strain',
    insect_bite: 'Insect Bite / Sting',
    eye_problem: 'Eye Problem',
    ear_pain: 'Ear Pain',
    urinary_symptoms: 'Urinary Symptoms',
    mental_health_concern: 'Mental Health Concern',
    toothache_dental_pain: 'Dental / Oral Health',
  }
  const categoryLabel = CATEGORY_LABELS[structuredContext.category] ?? structuredContext.category
  
  // Format key symptoms for display
  const keySymptomsText = Object.entries(structuredContext.answers)
    .map(([qId, ans]) => {
      const ansText = Array.isArray(ans) ? ans.join(', ') : ans
      return `- ${qId}: ${ansText}`
    })
    .join('\n')

  const copyToClipboard = () => {
    const textToCopy = `HEALNEST Assessment Summary
-------------------------
Main concern: ${categoryLabel}
Started: ${structuredContext.freeTextDescription ? "Reported in text" : t('summary.notSpecified')}
Red flags noted: ${assessmentResult.triggeredRedFlags.length > 0 ? assessmentResult.triggeredRedFlags.join(', ') : 'None'}
Recommended pathway: ${t(`outcome.${assessmentResult.outcome}`)}

Key symptoms/answers:
${keySymptomsText}

(User-reported information only)`

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleStartNew = () => {
    resetAssessment()
    navigate('/app/assess/who')
  }

  return (
    <div className="max-w-3xl mx-auto py-4 px-2 sm:px-4 space-y-6 animate-fade-in">
      <Card glass className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-heal-border pb-4">
          <div className="flex items-center gap-3 text-heal-teal">
            <FileText size={24} />
            <h1 className="font-display font-bold text-xl sm:text-2xl dark:text-white text-heal-text-light-heading">
              {t('heading.doctorSummary')}
            </h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<ClipboardCopy size={16} />}
            iconPosition="left"
            onClick={copyToClipboard}
          >
            {copied ? 'Copied!' : t('btn.copyClipboard')}
          </Button>
        </div>

        {/* AI Polish Section (Optional) */}
        {(isAiLoading || aiSummary) && (
          <div className="min-h-[80px]">
            {isAiLoading ? (
              <div className="flex items-center gap-2 text-sm text-heal-teal animate-pulse bg-heal-teal/10 p-4 rounded-xl border border-heal-teal/20">
                <Sparkles size={16} />
                <span>Drafting summary...</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl dark:bg-heal-bg-elevated/70 bg-slate-100 border border-heal-border text-sm leading-relaxed">
                <p className="dark:text-slate-200 text-slate-800">{aiSummary}</p>
              </div>
            )}
          </div>
        )}

        {/* Structured Data Section */}
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 p-3 rounded-lg dark:bg-heal-bg-elevated/40 bg-slate-50 border border-heal-border">
              <p className="text-xs font-semibold text-heal-text-muted">{t('summary.mainConcern')}</p>
              <p className="text-sm dark:text-white text-heal-text-light-heading font-medium">{categoryLabel}</p>
            </div>
            <div className="space-y-1 p-3 rounded-lg dark:bg-heal-bg-elevated/40 bg-slate-50 border border-heal-border">
              <p className="text-xs font-semibold text-heal-text-muted">{t('summary.recommendedPathway')}</p>
              <div className="mt-1">
                <OutcomeBadge outcome={assessmentResult.outcome} />
              </div>
            </div>
          </div>

          <div className="space-y-1 p-4 rounded-lg dark:bg-heal-bg-elevated/40 bg-slate-50 border border-heal-border">
            <p className="text-xs font-semibold text-heal-text-muted mb-2">{t('summary.redFlags')}</p>
            <p className="text-sm font-mono text-red-400">
              {assessmentResult.triggeredRedFlags.length > 0 
                ? assessmentResult.triggeredRedFlags.join(', ')
                : 'None'
              }
            </p>
          </div>

          <div className="space-y-1 p-4 rounded-lg dark:bg-heal-bg-elevated/40 bg-slate-50 border border-heal-border">
            <p className="text-xs font-semibold text-heal-text-muted mb-2">{t('summary.keySymptoms')}</p>
            <pre className="text-xs dark:text-slate-300 text-slate-700 whitespace-pre-wrap font-sans">
              {keySymptomsText}
            </pre>
          </div>
        </div>

        <p className="text-[10px] dark:text-heal-text-muted text-heal-text-light-muted text-center pt-4 border-t border-heal-border">
          {t('summary.footerNote')}
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<ArrowLeft size={15} />}
            iconPosition="left"
            onClick={() => navigate('/app/assess/results')}
          >
            {t('btn.backToResults')}
          </Button>
          <Button
            variant="primary"
            size="md"
            icon={<RefreshCw size={15} />}
            iconPosition="left"
            onClick={handleStartNew}
          >
            {t('btn.startNewCheck')}
          </Button>
        </div>
      </Card>
      <Disclaimer />
    </div>
  )
}
