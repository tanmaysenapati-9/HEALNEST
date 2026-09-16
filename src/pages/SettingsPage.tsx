import { useState, useEffect } from 'react'
import { Card, Button, Badge } from '../components'
import { Trash2, User, Globe, Moon, Sun, Monitor } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { clearTimeline } from '../store/TimelineStore'

export function SettingsPage() {
  const [displayName, setDisplayName] = useState(localStorage.getItem('healnesti_username') || 'Guest User')
  const [isEditingName, setIsEditingName] = useState(false)
  const { language, setLanguage } = useLanguage()
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(
    (localStorage.getItem('healnesti_theme') as any) || 'dark'
  )

  useEffect(() => {
    localStorage.setItem('healnesti_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // system
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [theme])

  const handleSaveName = () => {
    localStorage.setItem('healnesti_username', displayName)
    setIsEditingName(false)
  }

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all your data? This will delete your assessment timeline and reset all preferences. This action cannot be undone.')) {
      clearTimeline()
      localStorage.removeItem('healnesti_username')
      localStorage.removeItem('healnesti_theme')
      // Reset state
      setDisplayName('Guest User')
      setTheme('dark')
      alert('All local data has been cleared.')
    }
  }

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto p-4 md:p-8 space-y-8 animate-fade-in pb-24 relative overflow-hidden">
      {/* Ambient glowing orb for settings */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-heal-primary/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />

      <header className="mb-4 relative z-10">
        <Badge variant="teal" className="mb-4 inline-flex items-center bg-white/5 border-white/10 backdrop-blur-md">
          <Monitor size={12} className="mr-1 text-heal-primary" /> SYSTEM PREFERENCES
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading tracking-tight mb-2">
          Control <span className="gradient-text">Center</span>
        </h1>
        <p className="text-lg dark:text-heal-text-muted text-heal-text-light-muted">Manage your local profile, preferences, and application data.</p>
      </header>

      <section className="space-y-4 relative z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-heal-text-muted text-heal-text-light-muted">Profile Details</h2>
        <Card glass className="p-6 overflow-hidden relative group">
          {/* Subtle animated border top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-teal-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 relative z-10">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500/20 to-teal-500/5 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(20,184,166,0.15)] group-hover:scale-105 transition-transform duration-500">
              <User size={36} />
            </div>
            <div className="flex-grow flex flex-col justify-center">
              {isEditingName ? (
                <div className="flex items-center gap-3 w-full max-w-sm">
                  <input 
                    value={displayName} 
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)} 
                    className="flex-grow bg-black/40 border border-teal-500/50 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 shadow-inner backdrop-blur-sm"
                    autoFocus
                  />
                  <Button size="md" onClick={handleSaveName} className="shadow-[0_0_15px_rgba(20,184,166,0.3)]">Save</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-2xl font-bold dark:text-white text-heal-text-light-heading">{displayName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="dark:text-heal-text-muted text-heal-text-light-muted text-xs font-medium uppercase tracking-wider">Local Account Active</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsEditingName(true)} className="border-white/10 hover:border-white/20 bg-white/5">
                    Edit Profile
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4 relative z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider dark:text-heal-text-muted text-heal-text-light-muted">Environment Preferences</h2>
        <Card glass className="divide-y dark:divide-white/5 divide-black/5 overflow-hidden relative group">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-shadow">
                <Globe size={24} />
              </div>
              <div>
                <p className="font-semibold dark:text-white text-heal-text-light-heading">Language Interface</p>
                <p className="dark:text-heal-text-muted text-heal-text-light-muted text-sm mt-0.5">Select your preferred localization</p>
              </div>
            </div>
            <div className="relative">
              <select
                value={language}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setLanguage(e.target.value as any)}
                className="bg-black/30 dark:bg-black/40 border border-white/10 dark:text-white text-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 appearance-none backdrop-blur-md cursor-pointer transition-colors hover:border-white/20"
              >
                <option value="en">English (US)</option>
                <option value="es">Español</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                <Globe size={14} />
              </div>
            </div>
          </div>

          <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10 hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shadow-inner group-hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-shadow">
                {theme === 'dark' ? <Moon size={24} /> : theme === 'light' ? <Sun size={24} /> : <Monitor size={24} />}
              </div>
              <div>
                <p className="font-semibold dark:text-white text-heal-text-light-heading">Visual Appearance</p>
                <p className="dark:text-heal-text-muted text-heal-text-light-muted text-sm mt-0.5">Customize the application theme</p>
              </div>
            </div>
            
            {/* Premium toggle button group */}
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/10 w-full sm:w-auto backdrop-blur-md relative">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${theme === 'light' ? 'text-slate-900 bg-white shadow-md' : 'dark:text-white/60 text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Sun size={14} className={theme === 'light' ? 'text-amber-500' : ''} /> Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${theme === 'dark' ? 'text-white bg-slate-800 shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/10' : 'dark:text-white/60 text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Moon size={14} className={theme === 'dark' ? 'text-indigo-400' : ''} /> Dark
              </button>
              <button
                onClick={() => setTheme('system')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 relative z-10 flex items-center justify-center gap-2 ${theme === 'system' ? 'text-white bg-white/10 shadow-md border border-white/10' : 'dark:text-white/60 text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <Monitor size={14} /> Auto
              </button>
            </div>
          </div>
        </Card>
      </section>

      <section className="space-y-4 relative z-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-red-500/80">System Reset</h2>
        <Card glass className="p-6 border-red-500/20 bg-red-500/5 relative overflow-hidden group hover:border-red-500/40 transition-colors">
           <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[40px] rounded-full pointer-events-none group-hover:bg-red-500/20 transition-colors" />
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shadow-inner">
                <Trash2 size={24} />
              </div>
              <div>
                <p className="font-semibold text-red-400">Clear Local Storage</p>
                <p className="dark:text-red-400/60 text-red-900/60 text-sm mt-0.5">Permanently delete timeline history and settings.</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/50 shrink-0 gap-2 font-semibold shadow-[0_0_15px_rgba(239,68,68,0.1)] w-full sm:w-auto"
              onClick={handleClearData}
            >
              <Trash2 size={16} />
              Initialize Reset
            </Button>
          </div>
        </Card>
      </section>
    </div>
  )
}
