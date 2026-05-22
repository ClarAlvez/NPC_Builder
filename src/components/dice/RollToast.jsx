import { X } from 'lucide-react'
import RollResultLine from './RollResultLine'

export default function RollToast({ toast, onClose }) {
  if (!toast) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 w-[min(720px,calc(100vw-40px))] rounded-[24px] border border-zinc-700 bg-zinc-950/95 p-4 text-zinc-100 shadow-2xl backdrop-blur">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
            Resultado da rolagem
          </div>

          <div className="mt-1 truncate text-sm font-black text-white">
            {toast.title || 'Rolagem'}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition hover:border-zinc-600 hover:text-white"
          title="Fechar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <RollResultLine entry={toast.entry} />
    </div>
  )
}