import { useState, useMemo } from 'react'
import { Card, Badge } from '../components'
import { HeartPulse, Droplet, Moon, Apple, Activity, Thermometer, Info } from 'lucide-react'

type TipCategory = 'nutrition' | 'sleep' | 'exercise' | 'hydration' | 'mental_wellness' | 'seasonal' | 'all'

interface HealthTip {
  id: string
  category: TipCategory
  title: string
  content: string
  icon: any
  color: string
}

const TIPS: HealthTip[] = [
  {
    id: 'tip-1',
    category: 'hydration',
    title: 'Hydration is Key',
    content: 'Drink at least 8 glasses of water a day. Proper hydration improves skin health, boosts energy levels, and helps maintain cognitive function.',
    icon: Droplet,
    color: 'text-blue-400',
  },
  {
    id: 'tip-2',
    category: 'sleep',
    title: 'Optimize Your Sleep',
    content: 'Aim for 7-9 hours of quality sleep. Keep your room cool, dark, and avoid screens at least 1 hour before bedtime to improve sleep quality.',
    icon: Moon,
    color: 'text-indigo-400',
  },
  {
    id: 'tip-3',
    category: 'nutrition',
    title: 'Eat the Rainbow',
    content: 'Incorporate a variety of colorful fruits and vegetables into your meals. They provide essential vitamins, minerals, and antioxidants.',
    icon: Apple,
    color: 'text-green-400',
  },
  {
    id: 'tip-4',
    category: 'exercise',
    title: 'Move Every Day',
    content: 'Aim for at least 30 minutes of moderate physical activity daily. Even a brisk walk can significantly improve cardiovascular health.',
    icon: Activity,
    color: 'text-orange-400',
  },
  {
    id: 'tip-5',
    category: 'mental_wellness',
    title: 'Practice Mindfulness',
    content: 'Spend 5-10 minutes a day practicing deep breathing or meditation. This can help reduce stress and improve mental clarity.',
    icon: HeartPulse,
    color: 'text-pink-400',
  },
  {
    id: 'tip-6',
    category: 'seasonal',
    title: 'Flu Season Prep',
    content: 'Wash hands frequently and consider getting an annual flu vaccine to protect yourself and your community during flu season.',
    icon: Thermometer,
    color: 'text-red-400',
  },
  {
    id: 'tip-7',
    category: 'nutrition',
    title: 'Limit Processed Sugars',
    content: 'Reducing added sugars in your diet can help prevent energy crashes, improve dental health, and lower the risk of metabolic diseases.',
    icon: Apple,
    color: 'text-green-400',
  },
  {
    id: 'tip-8',
    category: 'sleep',
    title: 'Consistent Schedule',
    content: "Going to bed and waking up at the same time every day helps regulate your body's internal clock and can help you fall asleep and stay asleep for the night.",
    icon: Moon,
    color: 'text-indigo-400',
  },
  {
    id: 'tip-9',
    category: 'exercise',
    title: 'Strength Training',
    content: 'Incorporate strength training exercises at least twice a week. Building muscle mass supports joint health and boosts metabolism.',
    icon: Activity,
    color: 'text-orange-400',
  },
  {
    id: 'tip-10',
    category: 'mental_wellness',
    title: 'Stay Connected',
    content: 'Maintain strong social connections. Regular interactions with friends and family can provide emotional support and reduce feelings of loneliness.',
    icon: HeartPulse,
    color: 'text-pink-400',
  },
  {
    id: 'tip-11',
    category: 'hydration',
    title: 'Electrolytes Matter',
    content: 'If you exercise intensely or sweat heavily, plain water might not be enough. Consider replenishing electrolytes through food or specialized drinks.',
    icon: Droplet,
    color: 'text-blue-400',
  },
  {
    id: 'tip-12',
    category: 'seasonal',
    title: 'Sun Protection',
    content: 'Apply broad-spectrum sunscreen with an SPF of at least 30 even on cloudy days to protect your skin from harmful UV rays.',
    icon: Thermometer,
    color: 'text-yellow-400',
  },
]

export function HealthTipsPage() {
  const [filter, setFilter] = useState<TipCategory>('all')

  const filteredTips = useMemo(() => {
    if (filter === 'all') return TIPS
    return TIPS.filter(t => t.category === filter)
  }, [filter])

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto p-4 md:p-8 space-y-6 animate-fade-in pb-24 relative overflow-hidden">
      
      {/* Ambient background decorative floating elements */}
      <div className="absolute top-10 left-10 opacity-5 pointer-events-none animate-float-slow">
        <HeartPulse size={200} className="text-heal-primary" />
      </div>
      <div className="absolute top-1/3 right-10 opacity-[0.03] pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
        <Moon size={300} className="text-indigo-400" />
      </div>

      <header className="mb-6 relative z-10">
        <Badge variant="teal" className="mb-4 inline-flex items-center bg-heal-primary/10 border-heal-primary/30">
          <HeartPulse size={12} className="mr-1" /> DAILY WELLNESS
        </Badge>
        <h1 className="font-display text-3xl sm:text-4xl font-bold dark:text-white text-heal-text-light-heading mb-3 tracking-tight">
          Health <span className="gradient-text">Tips</span> & Wellness
        </h1>
        <p className="text-lg dark:text-heal-text-muted text-heal-text-light-muted max-w-lg">
          General wellness and preventive care advice for a healthier, balanced life.
        </p>
      </header>

      {/* Filter Categories */}
      <div className="flex flex-wrap gap-2 pb-6 relative z-10">
        {(['all', 'nutrition', 'sleep', 'exercise', 'hydration', 'mental_wellness', 'seasonal'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
              filter === cat
                ? 'bg-heal-primary text-white shadow-[0_0_15px_rgba(34,211,238,0.4)] scale-105'
                : 'dark:bg-white/5 bg-black/5 dark:text-white/70 text-slate-600 hover:bg-heal-bg-elevated border border-transparent dark:hover:border-white/10 hover:border-black/10'
            }`}
          >
            {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {filteredTips.map((tip) => (
          <div key={tip.id} className="group relative w-full h-full">
            <Card glass hover className="p-6 flex flex-col h-full border dark:border-white/5 border-black/5 group-hover:border-heal-primary/40 group-hover:bg-heal-bg-elevated/80 transition-all duration-500 overflow-hidden relative">
               
              {/* Interactive Hover Sweep */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-700">
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shine_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
              </div>

              {/* Glowing Blur Behind Icon */}
              <div className={`absolute top-6 left-6 w-16 h-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none ${tip.color.replace('text-', 'bg-')}`} />

              <div className="flex items-start justify-between mb-5 relative z-10">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center ${tip.color} shadow-lg backdrop-blur-md group-hover:scale-110 transition-transform duration-300`}>
                  <tip.icon size={28} />
                </div>
                <Badge variant="default" className="text-[10px] font-bold uppercase tracking-wider bg-black/20 dark:bg-white/5 border-white/10">
                  {tip.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="relative z-10 flex-grow flex flex-col">
                <h3 className="font-display text-xl font-bold dark:text-white text-heal-text-light-heading mb-3 group-hover:text-heal-primary transition-colors">{tip.title}</h3>
                <p className="dark:text-heal-text-muted text-heal-text-light-muted text-sm leading-relaxed flex-grow">
                  {tip.content}
                </p>
              </div>
            </Card>
          </div>
        ))}
      </div>
      
      {filteredTips.length === 0 && (
        <div className="text-center p-12 text-white/50 flex flex-col items-center relative z-10">
          <Info size={48} className="mb-4 opacity-30 animate-pulse" />
          <p className="text-lg">No tips found for this category.</p>
        </div>
      )}
    </div>
  )
}
