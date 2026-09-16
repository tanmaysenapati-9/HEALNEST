import { NavLink, useNavigate } from 'react-router-dom'
import {
  Home,
  Heart,
  Stethoscope,
  Lightbulb,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/app', icon: Home, label: 'Home', end: true },
  { to: '/app/timeline', icon: Heart, label: 'Timeline' },
  // PART 3: Symptoms route will become the main AI interaction screen
  { to: '/app/symptoms', icon: Stethoscope, label: 'Symptoms' },
  // PART 6: Health Tips will show personalized health tips
  { to: '/app/health-tips', icon: Lightbulb, label: 'Health Tips' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = () => {
    // PART 7: Clear user session/profile data on logout
    navigate('/')
  }

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl backdrop-blur-xl cursor-pointer"
        style={{
          background: 'rgba(15, 20, 32, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        }}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar panel — glassmorphism */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 flex flex-col backdrop-blur-2xl
          transform transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(8, 13, 26, 0.7)',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          boxShadow: '4px 0 30px rgba(0,0,0,0.6), inset -1px 0 0 rgba(255,255,255,0.02)',
        }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center relative overflow-hidden group"
            style={{ boxShadow: '0 4px 20px rgba(139,92,246,0.4), 0 0 30px rgba(59,130,246,0.2)' }}
          >
            <div className="absolute inset-0 bg-white/20 transform skew-x-12 -translate-x-full group-hover:animate-[slide-right_1s_ease-out]"></div>
            <Heart size={20} className="text-white relative z-10" fill="white" />
          </div>
          <div>
            <h1 className="text-lg font-bold dark:text-white text-heal-text-light-heading tracking-tight">
              HEALNEST
            </h1>
            <p className="text-[10px] dark:text-heal-text-muted text-heal-text-light-muted tracking-wide uppercase">
              Health Navigator
            </p>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
