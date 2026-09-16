export function AmbientBackground() {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base deep background */}
      <div className="absolute inset-0 bg-heal-bg-dark" />
      
      {/* Floating Orbs */}
      <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-heal-teal/10 blur-[120px] animate-drift pointer-events-none" />
      <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-heal-blue/10 blur-[150px] animate-drift-reverse pointer-events-none" />
      <div className="absolute -bottom-[20%] left-[20%] w-[60%] h-[40%] rounded-full bg-heal-teal/5 blur-[100px] animate-drift pointer-events-none" />
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] opacity-30" />
      
      {/* Particles Overlay (Simulated with radial gradient dots) */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 20px 20px'
      }} />
    </div>
  )
}
