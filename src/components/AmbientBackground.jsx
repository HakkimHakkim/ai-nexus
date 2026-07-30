export default function AmbientBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden transition-colors duration-300"
      style={{ background: 'var(--bg-app)' }}
    >
      <div
        className="absolute -left-32 -top-32 h-96 w-96 rounded-full blur-[100px] transition-colors duration-300"
        style={{ background: 'var(--orb-1)' }}
      />
      <div
        className="absolute right-0 top-1/3 h-80 w-80 rounded-full blur-[100px] transition-colors duration-300"
        style={{ background: 'var(--orb-2)' }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full blur-[110px] transition-colors duration-300"
        style={{ background: 'var(--orb-3)' }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full blur-[100px] transition-colors duration-300"
        style={{ background: 'var(--orb-4)' }}
      />
    </div>
  )
}
