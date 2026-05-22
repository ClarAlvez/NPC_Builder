import { useMemo, useState } from 'react'
import { Eye, LayoutPanelTop, Sparkles } from 'lucide-react'

const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

export default function NpcPreview({ data, manager }) {
  const [previewTab, setPreviewTab] = useState('rapida')

  const resumoTopo = useMemo(() => {
    const parts = [data?.classe, data?.trilha].filter(Boolean)
    return parts.length ? parts.join(' • ') : 'Classe • Trilha'
  }, [data?.classe, data?.trilha])

  return (
    <main className="min-w-0 h-full min-h-0 overflow-hidden">
      <div className="h-full min-h-0 rounded-[28px] border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl flex flex-col overflow-hidden">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div>
            <div className="mb-2 flex items-center gap-2 text-zinc-300">
              <Sparkles className="h-4 w-4" />

              <span className="text-xs uppercase tracking-[0.32em]">
                Prévia da ficha
              </span>
            </div>

            <h2 className="text-2xl font-black text-white">
              {data.nome || 'NPC sem nome'}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab('rapida')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                previewTab === 'rapida'
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-300'
              }`}
            >
              <Eye className="h-4 w-4" />
              Visualização rápida
            </button>

            <button
              type="button"
              onClick={() => setPreviewTab('completa')}
              className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold ${
                previewTab === 'completa'
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-300'
              }`}
            >
              <LayoutPanelTop className="h-4 w-4" />
              Visualização completa
            </button>
          </div>
        </div>

        {previewTab === 'rapida' ? (
          <QuickPreview data={data} resumoTopo={resumoTopo} manager={manager} />
        ) : (
          <FullPreview data={data} manager={manager} />
        )}
      </div>
    </main>
  )
}

function QuickPreview({ data, resumoTopo, manager }) {
  return (
    <div className={`flex-1 min-h-0 ${scrollClass}`}>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-zinc-800 bg-zinc-950">
          <div className="grid gap-6 p-6 lg:grid-cols-[240px_1fr]">
            <div>
              <div className="h-80 overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-900">
                {data.imagem ? (
                  <img
                    src={data.imagem}
                    alt={data.nome || 'NPC'}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                    Sem imagem
                  </div>
                )}
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-3xl font-black text-white">
                {data.nome || 'NPC sem nome'}
              </h3>

              <p className="mt-2 text-sm uppercase tracking-[0.24em] text-zinc-400">
                {resumoTopo} • {data.nex || '0'}%
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-5">
                <MiniStat label="PV" value={`${data.pvAtual || '0'}/${data.pv || '0'}`} />
                <MiniStat label="PE" value={`${data.peAtual || '0'}/${data.pe || '0'}`} />
                <MiniStat label="SAN" value={`${data.sanidadeAtual || '0'}/${data.sanidade || '0'}`} />
                <MiniStat label="DEF" value={data.defesa || '0'} />
                <MiniStat label="ESQ / BLQ" value={`${data.esquiva || '—'} / ${data.bloqueio || '—'}`} />
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <PreviewBox title="Informações básicas">
                  <div className="space-y-2 text-sm text-zinc-300">
                    <Line label="Equipe" value={data.equipe} />
                    <Line label="Origem" value={data.origem} />
                    <Line label="Elemento" value={data.elementoPrincipal} />
                    <Line label="Percepção" value={data.percepcao} />
                    <Line label="Iniciativa" value={data.iniciativa} />
                  </div>
                </PreviewBox>

                <PreviewBox title="Atributos">
                  <AttributeGrid data={data} />
                </PreviewBox>
              </div>
            </div>
          </div>
        </div>

        <PreviewBox title="Ataques">
          <AttackPreviewList attacks={data.ataques} />
        </PreviewBox>

        <PreviewBox title="Habilidades">
          <CollapsiblePreviewList
            items={data.habilidades}
            sectionKey="preview-habilidades"
            manager={manager}
            emptyText="Nenhuma habilidade adicionada."
          />
        </PreviewBox>
      </div>
    </div>
  )
}

function FullPreview({ data, manager }) {
  return (
    <div className={`flex-1 min-h-0 ${scrollClass}`}>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[280px_1fr]">
          <PreviewBox title="Retrato">
            <div className="h-[420px] overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950">
              {data.imagem ? (
                <img
                  src={data.imagem}
                  alt={data.nome || 'NPC'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-zinc-500">
                  Sem imagem
                </div>
              )}
            </div>
          </PreviewBox>

          <div className="space-y-6">
            <PreviewBox title="Identificação">
              <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-2">
                <Line label="Nome" value={data.nome} />
                <Line label="Equipe" value={data.equipe} />
                <Line label="Origem" value={data.origem} />
                <Line label="Classe" value={data.classe} />
                <Line label="Trilha" value={data.trilha} />
                <Line label="NEX" value={`${data.nex || '0'}%`} />
              </div>
            </PreviewBox>

            <PreviewBox title="Recursos e defesa">
              <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
                <Line label="PV" value={`${data.pvAtual || '0'}/${data.pv || '0'}`} />
                <Line label="PE" value={`${data.peAtual || '0'}/${data.pe || '0'}`} />
                <Line label="Sanidade" value={`${data.sanidadeAtual || '0'}/${data.sanidade || '0'}`} />
                <Line label="Defesa" value={data.defesa} />
                <Line label="Esquiva" value={data.esquiva} />
                <Line label="Bloqueio" value={data.bloqueio} />
                <Line label="Fortitude" value={data.fortitude} />
                <Line label="Reflexos" value={data.reflexos} />
                <Line label="Vontade" value={data.vontade} />
                <Line label="Deslocamento" value={data.deslocamento} />
                <Line label="Iniciativa" value={data.iniciativa} />
                <Line label="Percepção" value={data.percepcao} />
              </div>
            </PreviewBox>

            <PreviewBox title="Elemento e atributos">
              <div className="space-y-4 text-sm text-zinc-300">
                <Line label="Elemento principal" value={data.elementoPrincipal} />
                <AttributeGrid data={data} />
              </div>
            </PreviewBox>
          </div>
        </div>

        <PreviewBox title="Perícias">
          <div className="whitespace-pre-wrap text-sm text-zinc-300">
            {data.pericias || '—'}
          </div>
        </PreviewBox>

        <PreviewBox title="Defesas adicionais">
          <div className="grid gap-4 text-sm text-zinc-300 md:grid-cols-3">
            <TextColumn title="Resistências" value={data.resistencias} />
            <TextColumn title="Vulnerabilidades" value={data.vulnerabilidades} />
            <TextColumn title="Imunidades" value={data.imunidades} />
          </div>
        </PreviewBox>

        <PreviewBox title="Ataques">
          <AttackPreviewList attacks={data.ataques} />
        </PreviewBox>

        <PreviewBox title="Habilidades">
          <CollapsiblePreviewList
            items={data.habilidades}
            sectionKey="preview-completa-habilidades"
            manager={manager}
            emptyText="Nenhuma habilidade adicionada."
          />

          <NotesBlock title="Anotações de habilidades" value={data.habilidadesNotas} />
        </PreviewBox>

        <PreviewBox title="Rituais">
          <RitualPreviewList
            items={data.rituais}
            sectionKey="preview-completa-rituais"
            manager={manager}
          />

          <NotesBlock title="Anotações de rituais" value={data.rituaisNotas} />
        </PreviewBox>

        <PreviewBox title="Itens">
          <CollapsiblePreviewList
            items={data.itens}
            sectionKey="preview-completa-itens"
            manager={manager}
            emptyText="Nenhum item adicionado."
          />

          <NotesBlock title="Anotações de itens" value={data.itensNotas} />
        </PreviewBox>

        <div className="grid gap-6 xl:grid-cols-2">
          <PreviewBox title="Aparência">
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {data.aparencia || '—'}
            </div>
          </PreviewBox>

          <PreviewBox title="História">
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {data.historia || '—'}
            </div>
          </PreviewBox>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <PreviewBox title="Anotações gerais">
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {data.anotacoesGerais || '—'}
            </div>
          </PreviewBox>

          <PreviewBox title="Informações extras">
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {data.informacoesGerais || '—'}
            </div>
          </PreviewBox>
        </div>
      </div>
    </div>
  )
}

function PreviewBox({ title, children }) {
  return (
    <div className="rounded-[24px] border border-zinc-800 bg-zinc-900 p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-400">
        {title}
      </div>

      {children}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </div>

      <div className="mt-1 text-lg font-black text-white">
        {value || '—'}
      </div>
    </div>
  )
}

function AttributeGrid({ data }) {
  return (
    <div className="grid grid-cols-5 gap-2 text-center text-sm">
      {[
        ['AGI', data.agi],
        ['FOR', data.forca],
        ['INT', data.int],
        ['PRE', data.pre],
        ['VIG', data.vig],
      ].map(([label, value]) => (
        <div
          key={label}
          className="rounded-xl border border-zinc-800 bg-zinc-950 px-2 py-3"
        >
          <div className="text-[10px] text-zinc-500">{label}</div>

          <div className="mt-1 font-black text-white">
            {value || 0}
          </div>
        </div>
      ))}
    </div>
  )
}

function Line({ label, value }) {
  return (
    <div>
      <strong className="text-white">{label}:</strong>{' '}
      <span>{value || '—'}</span>
    </div>
  )
}

function TextColumn({ title, value }) {
  return (
    <div>
      <div className="mb-2 font-black text-white">{title}</div>

      <div className="whitespace-pre-wrap">
        {value || '—'}
      </div>
    </div>
  )
}

function AttackPreviewList({ attacks }) {
  const valid = (attacks || []).filter(
    (attack) =>
      attack.nome ||
      attack.teste ||
      attack.dano ||
      attack.danoMedio ||
      attack.extra
  )

  if (!valid.length) {
    return <div className="text-sm text-zinc-500 italic">Nenhum ataque.</div>
  }

  return (
    <div className="space-y-3">
      {valid.map((ataque, index) => (
        <div
          key={index}
          className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3"
        >
          <div className="font-black text-white">
            {ataque.nome || 'Ataque'}
          </div>

          <div className="mt-2 grid gap-2 text-sm text-zinc-300 md:grid-cols-4">
            <Line label="Teste" value={ataque.teste} />
            <Line label="Dano" value={ataque.dano} />
            <Line label="Dano médio" value={ataque.danoMedio} />
            <Line label="Extra" value={ataque.extra} />
          </div>
        </div>
      ))}
    </div>
  )
}

function CollapsiblePreviewList({
  items,
  sectionKey,
  manager,
  emptyText = '—',
}) {
  const valid = (items || []).filter((item) => {
    if (typeof item === 'string') return item.trim()
    return item?.nome?.trim()
  })

  if (!valid.length) {
    return <div className="text-sm text-zinc-500 italic">{emptyText}</div>
  }

  return (
    <div className="space-y-3">
      {valid.map((item, index) => {
        const current =
          typeof item === 'string' ? { nome: item, descricao: '' } : item

        const key = `${sectionKey}-${index}`

        return (
          <PreviewCollapsibleEntry
            key={key}
            title={current.nome || `${sectionKey} ${index + 1}`}
            expanded={!!manager.expandedEntries[key]}
            onToggle={() => manager.toggleEntry(key)}
          >
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {current.descricao || 'Sem descrição.'}
            </div>
          </PreviewCollapsibleEntry>
        )
      })}
    </div>
  )
}

function RitualPreviewList({ items, sectionKey, manager }) {
  const valid = (items || []).filter((item) => {
    if (typeof item === 'string') return item.trim()
    return item?.nome?.trim() || item?.dano?.trim()
  })

  if (!valid.length) {
    return <div className="text-sm text-zinc-500 italic">Nenhum ritual adicionado.</div>
  }

  return (
    <div className="space-y-3">
      {valid.map((item, index) => {
        const current =
          typeof item === 'string'
            ? { nome: item, descricao: '', dano: '' }
            : item

        const key = `${sectionKey}-${index}`

        return (
          <PreviewCollapsibleEntry
            key={key}
            title={current.nome || `Ritual ${index + 1}`}
            expanded={!!manager.expandedEntries[key]}
            onToggle={() => manager.toggleEntry(key)}
          >
            {current.dano && (
              <div className="mb-3 text-sm text-zinc-300">
                <strong className="text-white">Dano:</strong> {current.dano}
              </div>
            )}

            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {current.descricao || 'Sem descrição.'}
            </div>
          </PreviewCollapsibleEntry>
        )
      })}
    </div>
  )
}

function PreviewCollapsibleEntry({ title, expanded, onToggle, children }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-zinc-900"
      >
        <span className="truncate text-sm font-semibold text-zinc-100">
          {title}
        </span>

        <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
          {expanded ? 'Fechar' : 'Abrir'}
        </span>
      </button>

      {expanded ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

function NotesBlock({ title, value }) {
  if (!value) return null

  return (
    <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
        {title}
      </div>

      <div className="whitespace-pre-wrap text-sm text-zinc-300">
        {value}
      </div>
    </div>
  )
}