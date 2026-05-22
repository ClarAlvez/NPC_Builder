export default function NpcCardCompact({ npc, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-[20px] border p-3 text-left transition ${
        isActive
          ? 'border-zinc-500 bg-zinc-900'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 overflow-hidden rounded-2xl border border-zinc-700 bg-zinc-950 shrink-0">
          {npc.imagem ? (
            <img
              src={npc.imagem}
              alt={npc.nome}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[9px] uppercase tracking-[0.18em] text-zinc-500">
              NPC
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-white">
            {npc.nome || 'NPC sem nome'}
          </div>

          <div className="mt-1 truncate text-[10px] uppercase tracking-[0.18em] text-zinc-400">
            {npc.classe || 'Classe'} • {npc.trilha || 'Trilha'}
          </div>

          <div className="mt-1 flex gap-2 text-[10px] text-zinc-500">
            <span>PV {npc.pvAtual || '0'}/{npc.pv || '0'}</span>
            <span>PE {npc.peAtual || '0'}/{npc.pe || '0'}</span>
            <span>SAN {npc.sanidadeAtual || '0'}/{npc.sanidade || '0'}</span>
          </div>

          {npc.visibleInControl === false && (
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-600">
              Oculto do controle
            </div>
          )}
        </div>
      </div>
    </button>
  )
}