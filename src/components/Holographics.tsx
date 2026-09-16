import { ShieldCheck, Heart, Activity, Brain } from 'lucide-react'

export function HolographicRing() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Container for orbiting elements */}
      <div className="absolute top-1/2 left-1/2 w-[140%] h-[140%] -translate-x-1/2 -translate-y-1/2">
        
        {/* Orbit Path 1 - Inner */}
        <div className="absolute inset-4 rounded-full border border-heal-teal/10 border-dashed animate-[spin_30s_linear_infinite]" />
        
        {/* Orbit Path 2 - Outer */}
        <div className="absolute inset-0 rounded-full border border-heal-blue/10 animate-[spin_40s_linear_infinite_reverse]" />

        {/* Floating Icon 1 (Heart) */}
        <div className="absolute top-[15%] left-[20%] animate-float" style={{ animationDelay: '0s' }}>
          <div className="w-8 h-8 rounded-full bg-heal-bg-elevated/80 backdrop-blur border border-heal-danger/30 flex items-center justify-center shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <Heart size={14} className="text-heal-danger" />
          </div>
        </div>

        {/* Floating Icon 2 (Shield) */}
        <div className="absolute top-[20%] right-[15%] animate-float-slow" style={{ animationDelay: '1s' }}>
          <div className="w-10 h-10 rounded-full bg-heal-bg-elevated/80 backdrop-blur border border-heal-teal/30 flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)]">
            <ShieldCheck size={16} className="text-heal-teal" />
          </div>
        </div>

        {/* Floating Icon 3 (Brain) */}
        <div className="absolute bottom-[25%] left-[10%] animate-float-slow" style={{ animationDelay: '2.5s' }}>
          <div className="w-9 h-9 rounded-full bg-heal-bg-elevated/80 backdrop-blur border border-heal-purple-light/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.3)]">
            <Brain size={15} className="text-heal-purple-light" />
          </div>
        </div>

        {/* Floating Icon 4 (ECG) */}
        <div className="absolute bottom-[15%] right-[25%] animate-float" style={{ animationDelay: '1.5s' }}>
          <div className="w-8 h-8 rounded-full bg-heal-bg-elevated/80 backdrop-blur border border-emerald-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.3)]">
            <Activity size={14} className="text-emerald-400" />
          </div>
        </div>
        
        {/* Fake Data Panel */}
        <div className="absolute top-[40%] -right-[30%] animate-float-slow" style={{ animationDelay: '0.5s' }}>
          <div className="px-3 py-2 rounded-lg bg-heal-bg-elevated/80 backdrop-blur border border-heal-teal/20 shadow-[0_0_20px_rgba(34,211,238,0.15)] flex flex-col gap-1">
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-heal-teal animate-pulse" />
                <span className="text-[9px] font-bold text-heal-teal uppercase tracking-wider">AI Active</span>
             </div>
             <div className="h-1 w-16 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-heal-teal/50 w-full animate-[scanning-pulse_2s_ease-in-out_infinite]" />
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
