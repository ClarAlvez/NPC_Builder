import { Dices } from 'lucide-react'

export default function RollButton({ command, label, onRoll }) {
  const disabled = !command?.trim()

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onRoll?.(command, label)}
      className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-zinc-300 transition hover:border-zinc-500 disabled:cursor-not-allowed disabled:opacity-40"
      title="Rolar comando"
    >
      <Dices className="h-4 w-4" />
    </button>
  )
}