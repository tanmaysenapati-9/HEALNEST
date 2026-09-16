import { Sun, Moon, Monitor } from 'lucide-react'
import { useTheme } from '../theme/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const options: { value: 'dark' | 'light' | 'system'; icon: typeof Sun; label: string }[] = [
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div
      className="flex items-center rounded-xl p-1 gap-0.5 backdrop-blur-md"
      style={{
        background: 'rgba(15, 20, 32, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
      }}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer
            ${
              theme === value
                ? 'bg-gradient-primary text-white'
                : 'dark:text-heal-text-muted text-heal-text-light-muted dark:hover:text-white hover:text-heal-text-light'
            }
          `}
          style={theme === value ? { boxShadow: '0 2px 12px rgba(99,102,241,0.35)' } : undefined}
          title={label}
          aria-label={`Switch to ${label} theme`}
        >
          <Icon size={14} />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}
