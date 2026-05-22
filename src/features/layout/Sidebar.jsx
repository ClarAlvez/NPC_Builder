import {
  Copy,
  LogOut,
  Plus,
  Save,
  Search,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react'
import { elementOptions } from '../../models/npc'
import { inputStyle } from '../../components/common/Field'
import NpcCardCompact from '../npc/NpcCardCompact'

const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

export default function Sidebar({
  user,
  signOut,
  sidebarTab,
  setSidebarTab,
  manager,
}) {
  return (
    <aside className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur flex flex-col h-full min-h-0 overflow-hidden">
      <div className="mb-5 shrink-0">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4" />

            <span className="text-xs uppercase tracking-[0.32em]">
              C.R.I.S. inspired
            </span>
          </div>

          <button
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-xs font-semibold hover:border-zinc-500"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>

        <h1 className="text-2xl font-black tracking-tight">
          Banco de NPCs
        </h1>

        <p className="mt-2 text-sm text-zinc-400">
          Salve, edite, filtre e acompanhe todos os NPCs.
        </p>

        <p className="mt-2 text-xs text-zinc-500 break-all">
          {user.email}
        </p>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={manager.createNpc}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500"
        >
          <Plus className="h-4 w-4" />
          Novo
        </button>

        <button
          onClick={manager.saveAll}
          disabled={manager.isSaving}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          Salvar
        </button>

        <button
          onClick={manager.duplicateNpc}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500"
        >
          <Copy className="h-4 w-4" />
          Duplicar
        </button>

        <button
          onClick={manager.deleteNpc}
          className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-700"
        >
          Excluir
        </button>
      </div>

      {manager.savedMessage && (
        <div className="mb-4 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 shrink-0">
          {manager.savedMessage}
        </div>
      )}

      <div className="mb-4 grid grid-cols-3 gap-2 shrink-0">
        {[
          ['banco', 'Banco'],
          ['controle', 'Controle'],
          ['dados', 'Dados'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setSidebarTab(id)}
            className={`rounded-2xl px-3 py-2 text-sm font-semibold ${
              sidebarTab === id
                ? 'bg-white text-black'
                : 'border border-zinc-800 bg-zinc-950 text-zinc-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mb-4 shrink-0 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <input
            className={`${inputStyle} pl-10`}
            placeholder="Pesquisar NPC..."
            value={manager.searchTerm}
            onChange={(event) => manager.setSearchTerm(event.target.value)}
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <select
            className={`${inputStyle} pl-10`}
            value={manager.elementFilter}
            onChange={(event) => manager.setElementFilter(event.target.value)}
          >
            <option value="todos">Todos os elementos</option>

            {elementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

          <select
            className={`${inputStyle} pl-10`}
            value={manager.teamFilter}
            onChange={(event) => manager.setTeamFilter(event.target.value)}
          >
            <option value="todas">Todas as equipes</option>

            {manager.teamOptions.map((team) => (
              <option key={team} value={team}>
                {team}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={`space-y-3 flex-1 min-h-0 ${scrollClass}`}>
        {manager.filteredNpcs.length ? (
          manager.filteredNpcs.map((npc) => (
            <NpcCardCompact
              key={npc.id}
              npc={npc}
              isActive={npc.id === manager.data.id}
              onSelect={() => manager.setActiveNpcId(npc.id)}
            />
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-500">
            Nenhum NPC encontrado.
          </div>
        )}
      </div>
    </aside>
  )
}