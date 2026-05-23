export default function TotemLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-forest)] text-white">
      {children}
    </div>
  )
}
