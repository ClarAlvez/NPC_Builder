export default function SectionTitle({ children }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <div className="h-px flex-1 bg-zinc-800" />
      <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-zinc-300">
        {children}
      </h3>
      <div className="h-px flex-1 bg-zinc-800" />
    </div>
  )
}