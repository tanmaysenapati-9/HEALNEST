import { Outlet, useNavigate } from 'react-router-dom'
import { Bell, Search, User, X, CheckCircle2 } from 'lucide-react'
import { Sidebar, ThemeToggle, AmbientBackground, AiChatbot } from '../components'
import { useLanguage, type LanguageCode } from '../i18n/LanguageContext'
import { useAssessment } from '../context/AssessmentContext'
import { useState, useEffect, useRef } from 'react'

export function AppShell() {
  const { language, setLanguage } = useLanguage()
  const { isDemoMode } = useAssessment()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const [displayName, setDisplayName] = useState('User')

  // Load display name from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('healnesti_username')
    if (stored && stored.trim() && stored !== 'Guest User') {
      setDisplayName(stored.trim())
    }
  }, [])

  // Close notification panel when clicking outside
  useEffect(() => {
    if (!notifOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [notifOpen])

  return (
    <div className="min-h-screen dark:bg-transparent bg-heal-light flex relative">
      {/* Global deep atmospheric background */}
      <AmbientBackground />

      {/* Sidebar */}
      <Sidebar />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top bar */}
        <header
          className="sticky top-0 z-20 backdrop-blur-2xl"
          style={{
            background: 'rgba(8, 13, 26, 0.65)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            boxShadow: '0 4px 30px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.02)',
          }}
        >
          <div className="flex items-center justify-between px-4 lg:px-8 h-16">
            {/* Left: greeting */}
            <div className="flex items-center gap-3 pl-12 lg:pl-0">
              <h2 className="text-lg font-semibold dark:text-white text-heal-text-light-heading">
                Hi, <span className="gradient-text">{displayName}</span> 👋
              </h2>
              {isDemoMode && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase tracking-wider ml-2">
                  Demo Mode
                </span>
              )}
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3">
              {/* Search — navigates to Health Tips */}
              <button
                className="p-2 rounded-xl dark:text-heal-text-muted text-heal-text-light-muted dark:hover:bg-heal-bg-elevated hover:bg-heal-light-secondary transition-colors cursor-pointer"
                aria-label="Search health tips"
                title="Health Tips"
                onClick={() => navigate('/app/health-tips')}
              >
                <Search size={18} />
              </button>

              {/* Notification bell with popover */}
              <div className="relative" ref={notifRef}>
                <button
                  className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                    notifOpen
                      ? 'dark:bg-heal-bg-elevated bg-heal-light-secondary dark:text-white text-heal-text-light-heading'
                      : 'dark:text-heal-text-muted text-heal-text-light-muted dark:hover:bg-heal-bg-elevated hover:bg-heal-light-secondary'
                  }`}
                  aria-label="Notifications"
                  title="Notifications"
                  onClick={() => setNotifOpen(v => !v)}
                >
                  <Bell size={18} />
                  {/* No dot — no fake notifications */}
                </button>

                {/* Notification panel */}
                {notifOpen && (
                  <div
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                    style={{
                      background: 'rgba(10, 15, 30, 0.92)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backdropFilter: 'blur(20px)',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)',
                    }}
                  >
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                      <h3 className="text-sm font-semibold dark:text-white text-heal-text-light-heading">Notifications</h3>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="p-1 rounded-lg hover:bg-white/5 transition-colors dark:text-heal-text-muted text-heal-text-light-muted"
                        aria-label="Close notifications"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    {/* Empty state */}
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{
                          background: 'rgba(20,184,166,0.08)',
                          border: '1px solid rgba(20,184,166,0.15)',
                        }}
                      >
                        <CheckCircle2 size={22} className="text-heal-teal/60" />
                      </div>
                      <p className="text-sm font-medium dark:text-white/60 text-heal-text-light-muted">No new notifications</p>
                      <p className="text-xs dark:text-white/30 text-heal-text-light-muted/60">
                        You're all caught up! Notifications about your health checks will appear here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="bg-transparent text-sm font-medium dark:text-heal-text-muted text-heal-text-light-muted cursor-pointer focus:outline-none"
              >
                <option value="en">EN</option>
                <option value="ta">TA</option>
                <option value="hi">HI</option>
              </select>

              <ThemeToggle />

              {/* Avatar — navigates to settings */}
              <button
                className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-105"
                style={{ boxShadow: '0 2px 12px rgba(99,102,241,0.3)' }}
                title="Go to Settings"
                aria-label="Settings"
                onClick={() => navigate('/app/settings')}
              >
                <User size={16} className="text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-4 lg:p-8 relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Global AI Assistant Chatbot */}
      <AiChatbot />
    </div>
  )
}



