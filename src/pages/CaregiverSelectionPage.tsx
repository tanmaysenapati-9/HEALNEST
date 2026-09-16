import { useNavigate } from 'react-router-dom'
import { User, Users, UserPlus, HelpCircle } from 'lucide-react'
import { Card } from '../components'
import { useAssessment } from '../context/AssessmentContext'
import type { CaregiverContext } from '../context/AssessmentContext'

export function CaregiverSelectionPage() {
  const navigate = useNavigate()
  const { setCaregiverContext, resetAssessment } = useAssessment()

  const handleSelect = (context: CaregiverContext) => {
    resetAssessment() // ensure fresh state
    setCaregiverContext(context)
    navigate('/app/assess/start')
  }

  const options: { label: CaregiverContext; description: string; icon: any }[] = [
    { label: 'Me', description: 'I am checking symptoms for myself', icon: User },
    { label: 'My Child', description: 'I am checking symptoms for my child', icon: Users },
    { label: 'My Parent', description: 'I am checking symptoms for my parent', icon: UserPlus },
    { label: 'Someone Else', description: 'I am checking symptoms for someone else', icon: HelpCircle },
  ]

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 animate-fade-in">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold dark:text-white text-heal-text-light-heading tracking-tight mb-3">
          Who is this assessment for?
        </h1>
        <p className="text-lg dark:text-heal-text-muted text-heal-text-light-muted">
          We will adjust our questions and advice accordingly.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map((opt) => (
          <button
            key={opt.label}
            onClick={() => handleSelect(opt.label)}
            className="text-left"
          >
            <Card
              glass
              hover
              className="p-6 h-full border dark:border-white/10 border-black/5 hover:border-heal-primary/50 transition-all flex flex-col"
            >
              <div className="w-12 h-12 rounded-xl bg-heal-primary/10 flex items-center justify-center mb-4 text-heal-primary">
                <opt.icon size={24} />
              </div>
              <h3 className="text-xl font-semibold dark:text-white text-heal-text-light-heading mb-2">
                {opt.label}
              </h3>
              <p className="dark:text-heal-text-muted text-heal-text-light-muted">
                {opt.description}
              </p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
