import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Heart, ArrowRight, ArrowLeft, User } from 'lucide-react'
import { Button, Card } from '../components'
import { useLanguage, type LanguageCode } from '../i18n/LanguageContext'

interface ProfileData {
  name: string
  age: string
  sex: string
  language: LanguageCode
}

export function ProfileSetupPage() {
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [profile, setProfile] = useState<ProfileData>({
    name: '',
    age: '',
    sex: '',
    language: language,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // PART 2: Store profile in context/localStorage for personalization
    // PART 7: Connect to user session management
    setLanguage(profile.language)
    console.log('Profile submitted:', profile)
    navigate('/app')
  }

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
  }

  const isValid = profile.name.trim().length > 0 && profile.age.trim().length > 0

  return (
    <div className="min-h-screen dark:bg-heal-bg bg-heal-light flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow light sources */}
      <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.14) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'ambient-drift 20s ease-in-out infinite' }} />
      <div className="absolute bottom-[15%] right-[20%] w-[450px] h-[450px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'ambient-drift 25s ease-in-out infinite reverse' }} />

      <div className="w-full max-w-md animate-slide-up relative z-10">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 dark:text-heal-text-muted text-heal-text-light-muted hover:text-heal-blue transition-colors mb-6 text-sm"
        >
          <ArrowLeft size={16} />
          {t('nav.backHome')}
        </Link>

        <Card glass className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center mx-auto mb-4"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.4), 0 0 40px rgba(59,130,246,0.12)' }}
            >
              <Heart size={28} className="text-white" fill="white" />
            </div>
            <h1 className="font-display text-2xl font-bold dark:text-white text-heal-text-light-heading mb-2">
              {t('profile.welcome')} <span className="gradient-text">HEALNEST</span>
            </h1>
            <p className="text-sm dark:text-heal-text-muted text-heal-text-light-muted">
              {t('profile.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium dark:text-heal-text text-heal-text-light mb-1.5"
              >
                {t('profile.name')} <span className="text-heal-danger">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 dark:text-heal-text-muted text-heal-text-light-muted" />
                <input
                  id="name"
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl dark:bg-heal-bg-elevated/50 bg-heal-light-secondary/70 border border-heal-border
                             dark:text-white text-heal-text-light placeholder:dark:text-heal-text-muted/50 placeholder:text-heal-text-light-muted/50
                             focus:outline-none focus:border-heal-blue focus:ring-1 focus:ring-heal-blue/30 transition-all"
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium dark:text-heal-text text-heal-text-light mb-1.5"
              >
                {t('profile.age')} <span className="text-heal-danger">*</span>
              </label>
              <input
                id="age"
                type="number"
                min="1"
                max="120"
                value={profile.age}
                onChange={(e) => handleChange('age', e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-heal-bg-elevated/50 bg-heal-light-secondary/70 border border-heal-border
                           dark:text-white text-heal-text-light placeholder:dark:text-heal-text-muted/50 placeholder:text-heal-text-light-muted/50
                           focus:outline-none focus:border-heal-blue focus:ring-1 focus:ring-heal-blue/30 transition-all"
                required
              />
            </div>

            {/* Sex (optional) */}
            <div>
              <label
                htmlFor="sex"
                className="block text-sm font-medium dark:text-heal-text text-heal-text-light mb-1.5"
              >
                {t('profile.sex')} <span className="text-xs dark:text-heal-text-muted text-heal-text-light-muted">{t('profile.optional')}</span>
              </label>
              <select
                id="sex"
                value={profile.sex}
                onChange={(e) => handleChange('sex', e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-heal-bg-elevated/50 bg-heal-light-secondary/70 border border-heal-border
                           dark:text-white text-heal-text-light
                           focus:outline-none focus:border-heal-blue focus:ring-1 focus:ring-heal-blue/30 transition-all appearance-none cursor-pointer"
              >
                <option value="prefer_not">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label
                htmlFor="language"
                className="block text-sm font-medium dark:text-heal-text text-heal-text-light mb-1.5"
              >
                {t('profile.language')}
              </label>
              <select
                id="language"
                value={profile.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-4 py-3 rounded-xl dark:bg-heal-bg-elevated/50 bg-heal-light-secondary/70 border border-heal-border
                           dark:text-white text-heal-text-light
                           focus:outline-none focus:border-heal-blue focus:ring-1 focus:ring-heal-blue/30 transition-all appearance-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ta">Tamil</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-6"
              icon={<ArrowRight size={18} />}
              disabled={!isValid}
            >
              {t('btn.continue')}
            </Button>
          </form>

          {/* Disclaimer */}
          <p className="text-[10px] dark:text-heal-text-muted text-heal-text-light-muted text-center mt-6 leading-relaxed">
            {t('profile.disclaimer')}
          </p>
        </Card>
      </div>
    </div>
  )
}
