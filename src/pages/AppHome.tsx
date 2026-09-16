import { Card, Mascot, Badge, Button, HolographicRing } from '../components'
import { ArrowRight, Activity, Heart, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

/**
 * AppHome — Dashboard home screen inside the app shell.
 * PART 2+: This will be replaced with a real dashboard showing:
 * - Recent symptom checks
 * - Quick actions
 * - Health summary cards
 */
export function AppHome() {
  const navigate = useNavigate()

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome banner */}
      <Card glass className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 glow-radial opacity-30" />
        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          <div className="relative">
            <HolographicRing />
            <Mascot size={100} />
          </div>
          <div className="text-center md:text-left">
            <h2 className="font-display text-2xl font-bold dark:text-white text-heal-text-light-heading mb-2">
              Welcome to <span className="gradient-text">HEALNEST</span>
            </h2>
            <p className="dark:text-heal-text-muted text-heal-text-light-muted mb-4">
              Your AI-powered health navigator is ready. Describe your symptoms
              and get safety-checked guidance instantly.
            </p>
            <Button
              variant="primary"
              icon={<ArrowRight size={16} />}
              onClick={() => navigate('/app/assess/who')}
            >
              Check Symptoms
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick actions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* PART 3: Symptom checker */}
        <Card hover className="cursor-pointer" glass onClick={() => navigate('/app/assess/who')}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.4), 0 0 40px rgba(59,130,246,0.2)' }}
            >
              <Activity size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-heal-text-light-heading">Symptom Checker</p>
              <p className="text-xs dark:text-heal-text-muted text-heal-text-light-muted">AI-powered analysis</p>
            </div>
          </div>
        </Card>

        {/* My Health history */}
        <Card hover className="cursor-pointer" glass onClick={() => navigate('/app/timeline')}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl bg-gradient-teal flex items-center justify-center"
              style={{ boxShadow: '0 4px 20px rgba(34,211,238,0.4), 0 0 40px rgba(6,182,212,0.2)' }}
            >
              <Heart size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-heal-text-light-heading">My Health</p>
              <p className="text-xs dark:text-heal-text-muted text-heal-text-light-muted">View past checks</p>
            </div>
          </div>
        </Card>

        {/* Health Tips */}
        <Card hover className="cursor-pointer" glass onClick={() => navigate('/app/health-tips')}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center backdrop-blur-md"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                border: '1px solid rgba(34,211,238,0.25)',
                boxShadow: '0 0 20px rgba(34,211,238,0.15)',
              }}
            >
              <Shield size={18} className="text-heal-teal" />
            </div>
            <div>
              <p className="text-sm font-semibold dark:text-white text-heal-text-light-heading">Health Tips</p>
              <p className="text-xs dark:text-heal-text-muted text-heal-text-light-muted">Wellness & safety info</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Status badge */}
      <div className="text-center">
        <Badge variant="teal">
          <Shield size={12} />
          All systems operational · Safety engine active
        </Badge>
      </div>
    </div>
  )
}
