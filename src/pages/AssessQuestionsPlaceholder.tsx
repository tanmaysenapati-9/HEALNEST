import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowLeft, Brain } from 'lucide-react'
import { Card, Button, Badge } from '../components'
import { useAssessment } from '../context/AssessmentContext'

// PART 4: adaptive question UI goes here

export function AssessQuestionsPlaceholder() {
  const navigate = useNavigate()
  const { selectedCategory, structuredContext } = useAssessment()

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in text-center">
      <Card glass className="p-8 sm:p-12 space-y-6">
        <div
          className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto shadow-lg"
          style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}
        >
          <Brain size={30} className="text-white" />
        </div>

        <div className="space-y-2">
          <Badge variant="teal">PART 4 READY</Badge>
          <h1 className="font-display text-2xl sm:text-3xl font-bold dark:text-white text-heal-text-light-heading">
            Adaptive Questions Pipeline
          </h1>
          <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted max-w-md mx-auto">
            The Part 3 NLU layer has successfully extracted your symptom context and initialized
            the structured payload for the Part 2 Rule Engine.
          </p>
        </div>

        {/* Structured Context Payload Ready */}
        <div className="p-4 rounded-xl dark:bg-heal-bg-elevated bg-slate-100 border border-heal-border text-left font-mono text-xs overflow-x-auto">
          <p className="text-heal-teal font-bold mb-1.5 flex items-center gap-1.5">
            <CheckCircle2 size={14} /> Validated StructuredContext:
          </p>
          <pre className="text-slate-300">
            {JSON.stringify(
              {
                category: selectedCategory,
                answers: structuredContext?.answers || {},
                freeTextDescription: structuredContext?.freeTextDescription || '',
              },
              null,
              2
            )}
          </pre>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Button
            variant="outline"
            size="md"
            icon={<ArrowLeft size={16} />}
            iconPosition="left"
            onClick={() => navigate('/app/assess/confirm')}
          >
            Back to Confirmation
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/app')}
          >
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  )
}
