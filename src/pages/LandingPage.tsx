import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Zap,
  ShieldCheck,
  UserCheck,
  Lock,
  Brain,
  Eye,
  Activity,
  Heart,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react'
import {
  Button,
  Badge,
  Card,
  StatBlock,
  FeatureIcon,
  PhoneMockupFrame,
  ThemeToggle,
  Mascot,
  HolographicRing,
  ECGHeartbeatLine,
  Disclaimer,
  AmbientBackground
} from '../components'
import { useAssessment } from '../context/AssessmentContext'

export function LandingPage() {
  const navigate = useNavigate()
  const { setRawText, setExtractionResult, setIsDemoMode } = useAssessment()

  const handleDemoStart = () => {
    setIsDemoMode(true)
    setRawText("I accidentally burned my hand with boiling water about 20 minutes ago")
    setExtractionResult({
      category: 'burn',
      extractedFields: {
        cause: 'boiling water',
        approximateDuration: '20 minutes ago',
        bodyArea: 'hand'
      },
      originalText: "I accidentally burned my hand with boiling water about 20 minutes ago",
      confidence: 'high'
    })
    navigate('/app/assess/confirm')
  }

  return (
    <div className="min-h-screen dark:bg-heal-bg bg-heal-light relative selection:bg-heal-blue/30">
      {/* ===== AMBIENT GLOW LAYER — fixed light sources behind all content ===== */}
      <AmbientBackground />

      {/* ===== TOP NAVIGATION ===== */}
      <header
        className="sticky top-0 z-40 backdrop-blur-2xl"
        style={{
          background: 'rgba(8, 13, 26, 0.75)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div
              className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center transition-transform duration-200 hover:scale-105"
              style={{
                boxShadow: '0 4px 16px rgba(99,102,241,0.35), 0 0 30px rgba(59,130,246,0.15)',
              }}
            >
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div>
              <span className="font-display text-xl font-bold dark:text-white text-heal-text-light-heading tracking-tight">
                HEAL<span className="gradient-text">NEST</span>
              </span>
            </div>
          </div>

          {/* Subtitle badge / tagline */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-heal-text-muted">
            <span className="w-2 h-2 rounded-full bg-heal-teal animate-pulse" />
            From Symptoms to the Right Next Step
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/profile-setup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ===== HERO SECTION ===== */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-36">
        {/* Soft background ambient light blooms */}
        <div
          className="absolute top-4 left-[10%] w-[650px] h-[650px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute top-[20%] right-[5%] w-[550px] h-[550px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left: Text content + Signature ECG Moment */}
            <div className="lg:col-span-6 relative">
              {/* THE SIGNATURE MOMENT: continuous ECG pulse wave flowing behind headline */}
              <div className="absolute -top-12 sm:-top-8 -left-6 sm:-left-10 w-[120%] sm:w-[130%] -z-10 opacity-40 dark:opacity-50">
                <ECGHeartbeatLine />
              </div>

              {/* Status pill badge */}
              <Badge className="mb-6 inline-flex">
                <span className="w-2 h-2 rounded-full bg-heal-teal animate-pulse mr-1" />
                AI-POWERED · SAFETY-FIRST HEALTH COMPANION
              </Badge>

              {/* Distinct Display Heading */}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
                <span className="dark:text-white text-heal-text-light-heading block">
                  Small Symptoms.
                </span>
                <span className="gradient-text block">
                  Right Next Step.
                </span>
              </h1>

              {/* Supporting description */}
              <p className="text-base sm:text-lg dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed mb-8 max-w-xl">
                HEALNEST uses clinically guided AI to help you assess symptoms, calculate urgency,
                and navigate to the right level of care — with multi-layer safety verification
                at every step.
              </p>

              {/* Primary Call To Actions */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={<ArrowRight size={18} />}
                  onClick={() => navigate('/profile-setup')}
                >
                  Check Your Symptoms
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Explore How It Works
                </Button>
              </div>

              {/* Quick Trust Highlights below CTA */}
              <div className="mt-10 pt-6 border-t border-white/5 flex items-center gap-6 text-xs dark:text-heal-text-muted text-heal-text-light-muted">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-heal-teal" />
                  <span>3-Layer Safety Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-heal-teal" />
                  <span>On-Device Privacy</span>
                </div>
              </div>
            </div>

            {/* Right: Premium Staggered Phone Previews + Illustrated Mascot Anchor */}
            <div className="lg:col-span-6 relative flex items-center justify-center pt-8 lg:pt-0">
              {/* Soft mascot halo aura behind character */}
              <div className="absolute -top-12 -right-4 sm:right-2 z-30">
                <div className="relative">
                  <HolographicRing />
                  <Mascot size={135} />
                </div>
              </div>

              {/* Staggered Phone Showcase Trio */}
              <div className="relative flex items-end justify-center w-full max-w-[580px]">
                {/* 1. Left Phone: Health Vitals & Timeline (-4deg rotation) */}
                <PhoneMockupFrame
                  rotation={-4}
                  className="hidden sm:block -mr-10 -mb-4 z-10 opacity-90 hover:opacity-100 hover:z-30 transition-all duration-500 hover:drop-shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                >
                  <div className="p-3 pt-9 h-full flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-semibold dark:text-heal-text-muted text-heal-text-light-muted">
                          Health Overview
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      </div>

                      {/* Health Score Ring Card */}
                      <div className="rounded-xl p-2.5 mb-2.5 dark:bg-heal-bg-elevated/70 bg-white border border-heal-border">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-[9px] text-heal-text-muted">Biometric Status</p>
                            <p className="text-xs font-bold text-emerald-400">96% Normal</p>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center">
                            <Activity size={12} className="text-emerald-400" />
                          </div>
                        </div>
                      </div>

                      {/* Logged symptoms timeline */}
                      <p className="text-[9px] font-medium text-heal-text-muted px-1 mb-1.5">
                        Recent Log
                      </p>
                      <div className="space-y-1.5">
                        <div className="p-2 rounded-lg dark:bg-heal-bg-elevated/50 bg-white/60 border border-heal-border text-[9px]">
                          <p className="font-medium dark:text-white text-heal-text-light-heading">
                            Mild Fatigue
                          </p>
                          <p className="text-[8px] text-heal-text-muted">Resolved · 2 hrs ago</p>
                        </div>
                        <div className="p-2 rounded-lg dark:bg-heal-bg-elevated/50 bg-white/60 border border-heal-border text-[9px]">
                          <p className="font-medium dark:text-white text-heal-text-light-heading">
                            Hydration Check
                          </p>
                          <p className="text-[8px] text-heal-text-muted">Target met today</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2 rounded-lg bg-gradient-teal/10 border border-heal-teal/20 text-center">
                      <span className="text-[9px] font-semibold text-heal-teal">
                        Continuous Shield Active
                      </span>
                    </div>
                  </div>
                </PhoneMockupFrame>

                {/* 2. Center Phone: Live AI Symptom Triage In Action (Straight, elevated z-20) */}
                <PhoneMockupFrame
                  rotation={0}
                  className="z-20 scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.7)] hover:scale-[1.03] transition-transform duration-500 hover:drop-shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                >
                  <div className="p-3.5 pt-9 h-full flex flex-col justify-between text-left">
                    <div>
                      {/* App Header */}
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-md bg-gradient-primary flex items-center justify-center">
                            <Heart size={11} className="text-white" fill="white" />
                          </div>
                          <span className="text-[11px] font-bold dark:text-white text-heal-text-light-heading">
                            HEALNEST
                          </span>
                        </div>
                        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-heal-teal/15 text-heal-teal font-medium">
                          NLU Engine
                        </span>
                      </div>

                      {/* User Input Symptom Bubble */}
                      <div className="mb-2.5 p-2 rounded-xl dark:bg-heal-bg-elevated bg-slate-100 border border-heal-border">
                        <p className="text-[8px] text-heal-text-muted mb-0.5">Your Symptom Input</p>
                        <p className="text-[10px] font-medium dark:text-slate-100 text-slate-800">
                          "Throbbing headache and sensitivity to bright light since this morning."
                        </p>
                      </div>

                      {/* AI Triage Urgency Assessment Card */}
                      <div className="rounded-xl p-2.5 mb-2 dark:bg-heal-bg-elevated/90 bg-white border border-amber-500/30">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[8px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                            <AlertTriangle size={10} />
                            Moderate Urgency
                          </span>
                          <span className="text-[8px] text-heal-text-muted">Level 3</span>
                        </div>
                        <p className="text-[10px] font-semibold dark:text-white text-heal-text-light-heading mb-1">
                          Migraine with Photophobia
                        </p>
                        <p className="text-[8px] dark:text-heal-text-muted text-heal-text-light-muted leading-tight">
                          Rest in a dark room. Consult telehealth or GP if pain escalates past 24 hrs.
                        </p>
                      </div>

                      {/* Safety Red Flag Checks */}
                      <div className="space-y-1 px-0.5">
                        <div className="flex items-center gap-1 text-[8px] text-heal-teal">
                          <CheckCircle2 size={9} />
                          <span>No sudden severe onset (Thunderclap rule-out)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[8px] text-heal-teal">
                          <CheckCircle2 size={9} />
                          <span>No focal neurological deficit reported</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button inside phone */}
                    <div className="pt-2">
                      <div className="w-full py-2 rounded-lg bg-gradient-primary text-white text-[10px] font-semibold text-center cursor-pointer shadow-sm">
                        View Care Guidance
                      </div>
                    </div>
                  </div>
                </PhoneMockupFrame>

                {/* 3. Right Phone: 3-Layer Safety Verification (+4deg rotation) */}
                <PhoneMockupFrame
                  rotation={4}
                  className="hidden md:block -ml-10 -mb-4 z-10 opacity-90 hover:opacity-100 hover:z-30 transition-all duration-300"
                >
                  <div className="p-3 pt-9 h-full flex flex-col justify-between text-left">
                    <div>
                      <div className="flex items-center justify-between mb-3 px-1">
                        <span className="text-[10px] font-semibold dark:text-heal-text-muted text-heal-text-light-muted">
                          Safety Engine
                        </span>
                        <ShieldCheck size={13} className="text-heal-teal" />
                      </div>

                      <div className="text-center py-2">
                        <div className="w-9 h-9 rounded-xl bg-gradient-teal flex items-center justify-center mx-auto mb-1.5 shadow-md">
                          <ShieldCheck size={18} className="text-white" />
                        </div>
                        <p className="text-[10px] font-bold dark:text-white text-heal-text-light-heading">
                          Triple-Shield Verified
                        </p>
                      </div>

                      {/* 3 Safety Check Items */}
                      <div className="space-y-1.5 mt-1">
                        <div className="p-1.5 rounded-lg dark:bg-heal-bg-elevated/60 bg-white/70 border border-heal-border flex items-center gap-1.5 text-[8.5px]">
                          <CheckCircle2 size={10} className="text-heal-teal flex-shrink-0" />
                          <span>1. Red Flag Scan Passed</span>
                        </div>
                        <div className="p-1.5 rounded-lg dark:bg-heal-bg-elevated/60 bg-white/70 border border-heal-border flex items-center gap-1.5 text-[8.5px]">
                          <CheckCircle2 size={10} className="text-heal-teal flex-shrink-0" />
                          <span>2. Clinical Triage Validated</span>
                        </div>
                        <div className="p-1.5 rounded-lg dark:bg-heal-bg-elevated/60 bg-white/70 border border-heal-border flex items-center gap-1.5 text-[8.5px]">
                          <CheckCircle2 size={10} className="text-heal-teal flex-shrink-0" />
                          <span>3. Safe Non-Diagnostic Guard</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                      <span className="text-[8.5px] font-semibold text-emerald-400">
                        100% Safe For Patient
                      </span>
                    </div>
                  </div>
                </PhoneMockupFrame>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURE HIGHLIGHT ROW ===== */}
      <section
        id="features"
        className="py-20 lg:py-28 relative"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading mb-3 tracking-tight">
              Why Choose HEALNEST
            </h2>
            <p className="dark:text-heal-text-muted text-heal-text-light-muted max-w-lg mx-auto text-base">
              Smart clinical navigation designed with uncompromising safety principles
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <Card hover className="text-center">
              <FeatureIcon
                icon={<Zap size={22} />}
                label="Rapid Guidance"
                description="Instant, clinically structured symptom breakdown and evaluation"
              />
            </Card>
            <Card hover className="text-center">
              <FeatureIcon
                icon={<ShieldCheck size={22} />}
                label="Safety-Checked"
                description="Every response is screened against red-flag clinical guardrails"
              />
            </Card>
            <Card hover className="text-center">
              <FeatureIcon
                icon={<UserCheck size={22} />}
                label="Actionable Triage"
                description="Clear recommendations: self-care, GP consult, or emergency room"
              />
            </Card>
            <Card hover className="text-center">
              <FeatureIcon
                icon={<Lock size={22} />}
                label="Zero-Data Leakage"
                description="Your personal health logs remain strictly private on your device"
              />
            </Card>
          </div>
        </div>
      </section>

      {/* ===== STATS ROW ===== */}
      <section
        className="py-18 lg:py-24 relative"
        style={{ background: 'rgba(15, 20, 32, 0.45)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            <StatBlock
              value="Safety-First"
              label="Philosophy"
              description="Medical safety engine validates input and output prior to display"
            />
            <StatBlock
              value="3-Tier"
              label="Protection Matrix"
              description="Emergency guard → clinical rules → verified triage protocol"
            />
            <StatBlock
              value="24 / 7"
              label="Available"
              description="Always-ready guidance for you and your loved ones"
            />
          </div>
        </div>
      </section>

      {/* ===== MASCOT SHOWCASE ===== */}
      <section
        className="py-20 lg:py-28 relative overflow-hidden"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="absolute inset-0 glow-radial opacity-60 pointer-events-none" />
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <div className="mb-6 inline-block">
            <Mascot size={190} />
          </div>
          <h3 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading mb-4 tracking-tight">
            Meet Your Personal Health Companion
          </h3>
          <p className="dark:text-heal-text-muted text-heal-text-light-muted max-w-lg mx-auto mb-8 text-base leading-relaxed">
            Friendly, empathetic, and built with medical safeguards. HEALNEST gives you
            the clarity you need when health uncertainties arise.
          </p>
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRight size={18} />}
            onClick={() => navigate('/profile-setup')}
          >
            Start Your Health Journey
          </Button>
        </div>
      </section>

      {/* ===== TRUST ROW ===== */}
      <section
        className="py-18 lg:py-24 relative"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
              >
                <Brain size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-display font-semibold dark:text-white text-heal-text-light-heading mb-1 text-base">
                  Medical Reasoning
                </h4>
                <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
                  Advanced models contextualize your symptoms against established triage protocols.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl bg-gradient-teal flex items-center justify-center flex-shrink-0"
                style={{ boxShadow: '0 4px 16px rgba(34,211,238,0.3)' }}
              >
                <Eye size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-display font-semibold dark:text-white text-heal-text-light-heading mb-1 text-base">
                  Privacy Centric
                </h4>
                <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
                  No personally identifiable health data is ever sold or harvested for advertising.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
                  border: '1px solid rgba(99,102,241,0.25)',
                  boxShadow: '0 0 16px rgba(34,211,238,0.15)',
                }}
              >
                <ShieldCheck size={20} className="text-heal-teal" />
              </div>
              <div>
                <h4 className="font-display font-semibold dark:text-white text-heal-text-light-heading mb-1 text-base">
                  Clinically Guarded
                </h4>
                <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted leading-relaxed">
                  Engineered with explicit boundaries to prevent dangerous hallucinations or misguidance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="py-10 relative"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-heal-teal" />
            <span className="font-display font-bold text-sm dark:text-white text-heal-text-light-heading">
              HEAL<span className="gradient-text">NEST</span>
            </span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Disclaimer />
            <button
              onClick={handleDemoStart}
              className="text-xs text-heal-text-muted hover:text-heal-teal transition-colors mt-2"
            >
              Demo Mode
            </button>
            <p className="text-xs dark:text-heal-text-muted text-heal-text-light-muted text-center">
              © {new Date().getFullYear()} HEALNEST
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
