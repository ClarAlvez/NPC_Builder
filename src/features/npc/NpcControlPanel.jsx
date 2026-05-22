import { Eye, Sparkles } from 'lucide-react'
import { inputStyle } from '../../components/common/Field'

const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

export default function NpcControlPanel({
  npcs,
  trackerDeltas,
  setActiveNpcId,
  setSidebarTab,
  handleTrackerDeltaChange,
  applyTrackerChange,
}) {
  return (
    <main className="min-w-0 h-full min-h-0 xl:col-span-2 overflow-hidden">
      <div className="h-full min-h-0 rounded-[28px] border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl flex flex-col overflow-hidden">
        <div className="mb-5 shrink-0">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4" />

            <span className="text-xs uppercase tracking-[0.32em]">
              Controle geral
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            Controle de recursos dos NPCs
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Ajuste PV, PE e SAN apenas dos NPCs selecionados para aparecer no controle.
          </p>
        </div>

        <div className={`flex-1 min-h-0 ${scrollClass}`}>
          {npcs.length ? (
            <div className="grid auto-rows-[360px] gap-4 lg:grid-cols-2 2xl:grid-cols-3">
              {npcs.map((npc) => {
                const deltas = trackerDeltas[npc.id] || {}

                return (
                  <div
                    key={npc.id}
                    className="h-[360px] rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-5 flex flex-col"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3 shrink-0">
                      <div className="min-w-0">
                        <div className="truncate text-xl font-black text-white">
                          {npc.nome || 'NPC sem nome'}
                        </div>

                        <div className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {npc.classe || 'Classe'} • {npc.trilha || 'Trilha'}
                        </div>

                        {npc.equipe && (
                          <div className="mt-1 text-xs text-zinc-500">
                            Equipe: {npc.equipe}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setActiveNpcId(npc.id)
                          setSidebarTab('banco')
                        }}
                        className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-zinc-300 hover:border-zinc-500"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <ResourceBox label="PV" current={npc.pvAtual} max={npc.pv} />
                      <ResourceBox label="PE" current={npc.peAtual} max={npc.pe} />
                      <ResourceBox
                        label="SAN"
                        current={npc.sanidadeAtual}
                        max={npc.sanidade}
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      <DeltaField
                        label="PV"
                        value={deltas.pv || ''}
                        onChange={(value) =>
                          handleTrackerDeltaChange(npc.id, 'pv', value)
                        }
                      />

                      <DeltaField
                        label="PE"
                        value={deltas.pe || ''}
                        onChange={(value) =>
                          handleTrackerDeltaChange(npc.id, 'pe', value)
                        }
                      />

                      <DeltaField
                        label="SAN"
                        value={deltas.san || ''}
                        onChange={(value) =>
                          handleTrackerDeltaChange(npc.id, 'san', value)
                        }
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => applyTrackerChange(npc.id)}
                      className="mt-auto rounded-2xl bg-white px-4 py-3 text-sm font-black text-black hover:opacity-90"
                    >
                      Aplicar alterações
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-500">
              Nenhum NPC selecionado para aparecer no controle.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ResourceBox({ label, current, max }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3">
      <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </div>

      <div className="mt-2 text-xl font-black text-white">
        {current || '0'}
        <span className="text-sm text-zinc-500">/{max || '0'}</span>
      </div>
    </div>
  )
}

function DeltaField({ label, value, onChange }) {
  return (
    <label className="space-y-1">
      <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>

      <input
        className={inputStyle}
        placeholder="+0"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}