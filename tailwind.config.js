/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Premium Deep dark navy/black backgrounds
        'heal-bg': {
          DEFAULT: '#02050B',
          secondary: '#050A14',
          card: '#080D1A',
          elevated: '#0B1020',
        },
        // Light mode backgrounds (keep existing)
        'heal-light': {
          DEFAULT: '#f8fafc',
          secondary: '#f1f5f9',
          card: '#ffffff',
          elevated: '#ffffff',
        },
        // Accent electric blue
        'heal-blue': {
          DEFAULT: '#3b82f6',
          light: '#60a5fa',
          dark: '#1d4ed8', // deeper
          neon: '#4338ca', // neon tint
        },
        // Accent violet/purple
        'heal-purple': {
          DEFAULT: '#8b5cf6',
          light: '#a855f7',
          dark: '#6d28d9',
        },
        // Neon cyan accent
        'heal-teal': {
          DEFAULT: '#22d3ee',
          light: '#67e8f9',
          dark: '#0891b2',
          neon: '#06b6d4',
        },
        // Functional colors
        'heal-success': '#34d399',
        'heal-warning': '#fbbf24',
        'heal-danger': '#f43f5e',
        // Text colors
        'heal-text': {
          DEFAULT: '#f8fafc',
          muted: '#94a3b8',
          heading: '#ffffff',
        },
        'heal-text-light': {
          DEFAULT: '#1e293b',
          muted: '#64748b',
          heading: '#0f172a',
        },
        // Borders — glass-edge style
        'heal-border': {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          light: 'rgba(255, 255, 255, 0.04)',
          accent: 'rgba(34, 211, 238, 0.2)', // subtle cyan border
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        'gradient-primary-hover': 'linear-gradient(135deg, #2563eb, #7c3aed)',
        'gradient-teal': 'linear-gradient(135deg, #06b6d4, #22d3ee)',
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        // Glass-gradient for icon badges
        'gradient-icon-glass': 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.15))',
        // Subtle futuristic cyan-to-purple gradient
        'gradient-futuristic': 'linear-gradient(135deg, rgba(34,211,238,0.1) 0%, rgba(139,92,246,0.1) 100%)',
      },
      boxShadow: {
        // Layered card shadows — lift + depth + color glow
        'glow-blue': '0 0 20px rgba(59, 130, 246, 0.25), 0 0 60px rgba(59, 130, 246, 0.08)',
        'glow-purple': '0 0 20px rgba(139, 92, 246, 0.25), 0 0 60px rgba(139, 92, 246, 0.08)',
        'glow-teal': '0 0 20px rgba(34, 211, 238, 0.25), 0 0 60px rgba(34, 211, 238, 0.08)',
        'glow-neon': '0 0 10px rgba(34, 211, 238, 0.5), 0 0 30px rgba(34, 211, 238, 0.2)',
        // Primary button glow — emits light underneath
        'btn-glow': '0 4px 15px rgba(139, 92, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.1)',
        'btn-glow-hover': '0 6px 20px rgba(139, 92, 246, 0.45), 0 0 40px rgba(59, 130, 246, 0.2)',
        // Layered card depth: tight dark lift + soft spread + colored halo
        'card': '0 2px 10px rgba(0,0,0,0.5), 0 10px 30px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.05)',
        'card-hover': '0 5px 15px rgba(0,0,0,0.6), 0 15px 40px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1), 0 0 20px rgba(34,211,238,0.05)',
        // Glass panel shadow (sidebar, topbar)
        'glass': '0 4px 30px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.08)',
        // Phone frame
        'phone': '0 10px 40px rgba(0,0,0,0.8), 0 0 80px rgba(34,211,238,0.05), inset 0 1px 1px rgba(255,255,255,0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'ambient-drift': 'ambient-drift 25s ease-in-out infinite',
        'scanning-pulse': 'scanning-pulse 2s ease-in-out infinite',
        'drift': 'drift 20s linear infinite',
        'drift-reverse': 'drift-reverse 25s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.98)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'ambient-drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(20px, -15px) scale(1.03)' },
          '66%': { transform: 'translate(-15px, 10px) scale(0.97)' },
        },
        'scanning-pulse': {
          '0%, 100%': { opacity: '0.3', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.5)' },
        },
        drift: {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(2%, -2%) rotate(2deg)' },
          '66%': { transform: 'translate(-2%, 1%) rotate(-1deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        'drift-reverse': {
          '0%': { transform: 'translate(0, 0) rotate(0deg)' },
          '33%': { transform: 'translate(-2%, 2%) rotate(-2deg)' },
          '66%': { transform: 'translate(1%, -1%) rotate(1deg)' },
          '100%': { transform: 'translate(0, 0) rotate(0deg)' },
        },
        shine: {
          '0%': { transform: 'translateX(-100%) skewX(12deg)' },
          '100%': { transform: 'translateX(200%) skewX(12deg)' },
        },
        'flow-down': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
