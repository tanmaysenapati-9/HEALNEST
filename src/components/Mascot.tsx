interface MascotProps {
  className?: string
  size?: number
}

export function Mascot({ className = '', size = 200 }: MascotProps) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Soft ambient halo / glow aura behind character — visual anchor */}
      <div
        className="absolute -inset-8 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.28) 0%, rgba(139, 92, 246, 0.18) 40%, rgba(34, 211, 238, 0.08) 65%, transparent 80%)',
          filter: 'blur(32px)',
        }}
        aria-hidden="true"
      />

      {/* Illustrated Friendly AI Health Mascot */}
      <svg
        width={size}
        height={size * 1.08}
        viewBox="0 0 240 260"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 select-none filter drop-shadow-[0_12px_28px_rgba(0,0,0,0.45)]"
        aria-label="HEALNEST Friendly AI Health Robot Mascot"
        role="img"
      >
        <defs>
          {/* Ceramic white helmet gradient */}
          <linearGradient id="robotHeadGrad" x1="120" y1="28" x2="120" y2="128" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="65%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* Visor obsidian depth gradient */}
          <linearGradient id="visorGrad" x1="120" y1="48" x2="120" y2="112" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#080c16" />
            <stop offset="100%" stopColor="#101828" />
          </linearGradient>

          {/* Body ceramic gradient */}
          <linearGradient id="robotBodyGrad" x1="120" y1="130" x2="120" y2="225" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>

          {/* Cyan glow filter for LED eyes and heart */}
          <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Heart pulse glow filter */}
          <filter id="heartGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Ear-pod metallic gradient */}
          <linearGradient id="earGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          {/* Specular glass shine */}
          <linearGradient id="glassShine" x1="60" y1="50" x2="180" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Biometric Heart Gradient */}
          <linearGradient id="biometricHeart" x1="100" y1="150" x2="140" y2="185" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ff4b72" />
            <stop offset="50%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#8b5cf6" />
          </linearGradient>

          {/* Hover thruster underglow */}
          <radialGradient id="thrusterGlow" cx="120" cy="245" r="45" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* --- Hover Thruster / Foot Pods --- */}
        <ellipse cx="120" cy="245" rx="42" ry="10" fill="url(#thrusterGlow)" />
        <ellipse cx="98" cy="232" rx="14" ry="7" fill="#64748b" />
        <ellipse cx="142" cy="232" rx="14" ry="7" fill="#64748b" />
        <ellipse cx="98" cy="230" rx="11" ry="5" fill="#22d3ee" filter="url(#cyanGlow)" />
        <ellipse cx="142" cy="230" rx="11" ry="5" fill="#22d3ee" filter="url(#cyanGlow)" />

        {/* --- Arms --- */}
        {/* Left Arm (Relaxed) */}
        <path
          d="M62 144 C42 152 40 178 52 195 C56 200 64 198 67 192 C74 178 74 158 72 148 Z"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <circle cx="56" cy="195" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

        {/* Right Arm (Friendly wave/greeting) */}
        <path
          d="M178 144 C198 148 206 130 196 112 C192 106 184 108 181 114 C174 126 172 138 168 148 Z"
          fill="#cbd5e1"
          stroke="#94a3b8"
          strokeWidth="1.5"
        />
        <circle cx="196" cy="110" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />

        {/* --- Torso / Body --- */}
        <rect
          x="68"
          y="126"
          width="104"
          height="100"
          rx="24"
          fill="url(#robotBodyGrad)"
          stroke="#94a3b8"
          strokeWidth="2"
        />

        {/* Chest Accent Plates */}
        <path
          d="M74 134 Q120 142 166 134"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Biometric Heart Chamber (Recessed monitor) */}
        <rect
          x="88"
          y="148"
          width="64"
          height="54"
          rx="14"
          fill="#0a0e1a"
          stroke="rgba(59,130,246,0.3)"
          strokeWidth="1.5"
        />

        {/* Glowing Heart Emblem */}
        <path
          d="M120 186 C104 174 98 165 98 158 C98 152 102 148 107.5 148 C111.5 148 116 150.5 120 154 C124 150.5 128.5 148 132.5 148 C138 148 142 152 142 158 C142 165 136 174 120 186 Z"
          fill="url(#biometricHeart)"
          filter="url(#heartGlow)"
        />

        {/* ECG pulse inside heart monitor */}
        <path
          d="M94 175 L106 175 L110 168 L114 180 L118 164 L122 178 L126 172 L130 175 L146 175"
          stroke="#ffffff"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />

        {/* Medical Stethoscope draping over shoulders */}
        <path
          d="M82 126 C76 138 72 170 88 184 C92 188 96 188 98 182"
          stroke="#22d3ee"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="89" cy="186" r="6" fill="#0ea5e9" stroke="#22d3ee" strokeWidth="2" />
        <circle cx="89" cy="186" r="2.5" fill="#ffffff" />

        {/* --- Head Unit --- */}
        {/* Antenna Mast & Orb */}
        <line x1="120" y1="28" x2="120" y2="10" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <circle cx="120" cy="8" r="6" fill="#22d3ee" filter="url(#cyanGlow)" />
        <circle cx="120" cy="8" r="2.5" fill="#ffffff" />

        {/* Helmet Base */}
        <rect
          x="50"
          y="26"
          width="140"
          height="98"
          rx="32"
          fill="url(#robotHeadGrad)"
          stroke="#94a3b8"
          strokeWidth="2.5"
        />

        {/* Ear-pod left */}
        <rect x="42" y="52" width="10" height="42" rx="5" fill="url(#earGrad)" stroke="#1e40af" strokeWidth="1" />
        <circle cx="47" cy="73" r="3" fill="#22d3ee" filter="url(#cyanGlow)" />

        {/* Ear-pod right */}
        <rect x="188" y="52" width="10" height="42" rx="5" fill="url(#earGrad)" stroke="#1e40af" strokeWidth="1" />
        <circle cx="193" cy="73" r="3" fill="#22d3ee" filter="url(#cyanGlow)" />

        {/* Curved Obsidian Visor */}
        <rect
          x="58"
          y="38"
          width="124"
          height="74"
          rx="22"
          fill="url(#visorGrad)"
          stroke="rgba(59,130,246,0.35)"
          strokeWidth="1.5"
        />

        {/* Visor Glass Specular Arc */}
        <path
          d="M66 48 C85 43 155 43 174 48 C160 56 80 56 66 48 Z"
          fill="url(#glassShine)"
        />

        {/* Expressive Glowing Cyan LED Eyes */}
        {/* Left Eye */}
        <g filter="url(#cyanGlow)">
          <path
            d="M84 68 C84 62 90 58 98 58 C106 58 112 62 112 68 C112 75 106 78 98 78 C90 78 84 75 84 68 Z"
            fill="#22d3ee"
          />
          {/* Eye reflection sparkles */}
          <circle cx="94" cy="64" r="3" fill="#ffffff" />
          <circle cx="102" cy="71" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>

        {/* Right Eye */}
        <g filter="url(#cyanGlow)">
          <path
            d="M128 68 C128 62 134 58 142 58 C150 58 156 62 156 68 C156 75 150 78 142 78 C134 78 128 75 128 68 Z"
            fill="#22d3ee"
          />
          {/* Eye reflection sparkles */}
          <circle cx="138" cy="64" r="3" fill="#ffffff" />
          <circle cx="146" cy="71" r="1.5" fill="#ffffff" opacity="0.8" />
        </g>

        {/* Friendly LED Smile Arc */}
        <path
          d="M106 88 Q120 98 134 88"
          stroke="#22d3ee"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#cyanGlow)"
          fill="none"
        />
      </svg>
    </div>
  )
}
