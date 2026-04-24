import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Save,
  Plus,
  Trash2,
  Sparkles,
  ImagePlus,
  BookOpen,
  WandSparkles,
  StickyNote,
  Shield,
  Heart,
  Brain,
  Zap,
  Check,
  Copy,
  LogOut,
  Eye,
  LayoutPanelTop,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { supabase } from './lib/supabase'

const elementOptions = ['Sangue', 'Morte', 'Energia', 'Conhecimento', 'Medo']

const createEmptyNpc = () => ({
  id: crypto.randomUUID(),
  nome: '',
  equipe: '',
  origem: '',
  classe: '',
  trilha: '',
  nex: '0',
  elementoPrincipal: 'Sangue',
  elementosSecundarios: [],
  percepcao: '',
  iniciativa: '',
  defesa: '',
  esquiva: '',
  bloqueio: '',
  fortitude: '',
  reflexos: '',
  vontade: '',
  pv: '',
  pvAtual: '',
  pe: '',
  peAtual: '',
  sanidade: '',
  sanidadeAtual: '',
  deslocamento: '',
  resistencias: '',
  vulnerabilidades: '',
  imunidades: '',
  pericias: '',
  aparencia: '',
  anotacoesGerais: '',
  historia: '',
  informacoesGerais: '',
  itensNotas: '',
  habilidadesNotas: '',
  rituaisNotas: '',
  imagem: '',
  ataques: [{ nome: '', teste: '', dano: '', extra: '' }],
  habilidades: [{ nome: '', descricao: '' }],
  itens: [{ nome: '', descricao: '' }],
  rituais: [{ nome: '', descricao: '' }],
  agi: 0,
  forca: 0,
  int: 0,
  pre: 0,
  vig: 0,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})

const labelStyle = 'text-xs uppercase tracking-[0.24em] text-zinc-400'
const inputStyle =
  'w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500'
const textareaStyle = `${inputStyle} min-h-[96px] resize-y`
const tabButtonStyle =
  'inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition'
const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

function normalizeNpcRow(row) {
  return {
    ...(row.data || {}),
    id: row.id,
  }
}

function serializeNpcForDb(npc) {
  return {
    ...npc,
    id: npc.id,
  }
}

function clampResource(current, max, delta) {
  const currentNumber = Number(current || 0)
  const maxNumber = Number(max || 0)
  const deltaNumber = Number(delta || 0)

  if (!Number.isFinite(deltaNumber)) return String(currentNumber)

  const raw = currentNumber + deltaNumber
  if (!maxNumber) return String(Math.max(0, raw))
  return String(Math.max(0, Math.min(maxNumber, raw)))
}

function SectionTitle({ children }) {
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

function Field({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>
      <input
        type={type}
        className={inputStyle}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

function TextBlock({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 5,
}) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>
      <textarea
        className={textareaStyle}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </label>
  )
}

function StatQuickAdjust({ icon: Icon, label, current, max, onAdjust }) {
  return (
    <div className="rounded-[22px] border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-3 flex items-center gap-2 text-zinc-300">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.24em]">{label}</span>
      </div>
      <div className="text-2xl font-black text-white">
        {current || '0'}
        <span className="text-sm text-zinc-500">/{max || '0'}</span>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onAdjust(-1)}
          className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm font-bold hover:border-zinc-500"
        >
          -1
        </button>
        <button
          type="button"
          onClick={() => onAdjust(1)}
          className="flex-1 rounded-xl border border-zinc-700 py-2 text-sm font-bold hover:border-zinc-500"
        >
          +1
        </button>
      </div>
    </div>
  )
}

function NpcCardCompact({ npc, isActive, onSelect }) {
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
        </div>
      </div>
    </button>
  )
}

function SecondaryElementPicker({ selected, onToggle }) {
  return (
    <div className="space-y-2">
      <div className={labelStyle}>Elementos secundários</div>
      <div className="flex flex-wrap gap-2">
        {elementOptions.map((option) => {
          const active = selected.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => onToggle(option)}
              className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'border-white bg-white text-black'
                  : 'border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <Check className="h-4 w-4" /> {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function PreviewBox({ title, children, className = '' }) {
  return (
    <div className={`rounded-[24px] border border-zinc-800 bg-zinc-900 p-4 ${className}`}>
      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-400">
        {title}
      </div>
      {children}
    </div>
  )
}

function AttackPreviewList({ attacks }) {
  const valid = (attacks || []).filter(
    (a) => a.nome || a.teste || a.dano || a.extra
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
          <div className="font-black text-white">{ataque.nome || 'Ataque'}</div>
          <div className="mt-2 grid gap-2 text-sm text-zinc-300 md:grid-cols-3">
            <div>
              <span className="text-zinc-500">Teste:</span> {ataque.teste || '—'}
            </div>
            <div>
              <span className="text-zinc-500">Dano:</span> {ataque.dano || '—'}
            </div>
            <div>
              <span className="text-zinc-500">Extra:</span> {ataque.extra || '—'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function CollapsibleEntry({
  title,
  expanded,
  onToggle,
  onRemove,
  children,
  danger = false,
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="flex flex-1 items-center justify-between rounded-xl px-2 py-2 text-left hover:bg-zinc-900"
        >
          <span className="truncate text-sm font-semibold text-zinc-100">
            {title}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-violet-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-violet-400" />
          )}
        </button>

        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className={`rounded-xl px-3 py-2 text-sm ${
              danger
                ? 'text-red-300 hover:bg-red-950/40'
                : 'text-zinc-300 hover:bg-zinc-900'
            }`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {expanded ? <div className="mt-3">{children}</div> : null}
    </div>
  )
}

function CollapsiblePreviewList({
  items,
  sectionKey,
  expandedEntries,
  toggleEntry,
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
          <CollapsibleEntry
            key={key}
            title={current.nome || `${sectionKey} ${index + 1}`}
            expanded={!!expandedEntries[key]}
            onToggle={() => toggleEntry(key)}
          >
            <div className="whitespace-pre-wrap text-sm text-zinc-300">
              {current.descricao || 'Sem descrição.'}
            </div>
          </CollapsibleEntry>
        )
      })}
    </div>
  )
}

function AuthScreen() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    if (!email || !password) {
      setMessage('Preencha email e senha.')
      setLoading(false)
      return
    }

    let result

    if (mode === 'login') {
      result = await supabase.auth.signInWithPassword({ email, password })
    } else {
      result = await supabase.auth.signUp({ email, password })
    }

    if (result.error) {
      setMessage(result.error.message)
    } else {
      setMessage(
        mode === 'login'
          ? 'Login realizado com sucesso.'
          : 'Conta criada com sucesso.'
      )
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-6 shadow-2xl"
      >
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs uppercase tracking-[0.32em]">
              Banco de NPCs
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Suas fichas ficam salvas por conta no Supabase
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Seu email"
            className={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Sua senha"
            className={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-black text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? 'Carregando...'
              : mode === 'login'
              ? 'Entrar'
              : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={() =>
              setMode((prev) => (prev === 'login' ? 'register' : 'login'))
            }
            className="w-full rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm font-semibold hover:border-zinc-500"
          >
            {mode === 'login'
              ? 'Não tem conta? Criar conta'
              : 'Já tem conta? Entrar'}
          </button>

          {message && (
            <div className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300">
              {message}
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default function App() {
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  const [npcs, setNpcs] = useState([])
  const [activeNpcId, setActiveNpcId] = useState(null)
  const [savedMessage, setSavedMessage] = useState('')
  const [formTab, setFormTab] = useState('gerais')
  const [previewTab, setPreviewTab] = useState('rapida')
  const [sidebarTab, setSidebarTab] = useState('banco')
  const [dataLoading, setDataLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [elementFilter, setElementFilter] = useState('todos')
  const [trackerDeltas, setTrackerDeltas] = useState({})
  const [expandedEntries, setExpandedEntries] = useState({})

  const initialLoadDone = useRef(false)
  const autosaveTimeout = useRef(null)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session ?? null)
      setAuthLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession ?? null)
      setAuthLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const user = session?.user ?? null

  useEffect(() => {
    async function loadNpcs() {
      if (!user) {
        setNpcs([])
        setActiveNpcId(null)
        initialLoadDone.current = false
        return
      }

      setDataLoading(true)

      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        console.error(error)
        setSavedMessage('Erro ao carregar fichas')
        setDataLoading(false)
        return
      }

      if (data && data.length > 0) {
        const mapped = data.map(normalizeNpcRow)
        setNpcs(mapped)
        setActiveNpcId(mapped[0].id)
      } else {
        const fresh = createEmptyNpc()
        const { data: inserted, error: insertError } = await supabase
          .from('npcs')
          .insert({
            id: fresh.id,
            user_id: user.id,
            nome: fresh.nome || 'NPC sem nome',
            data: serializeNpcForDb(fresh),
          })
          .select()
          .single()

        if (insertError) {
          console.error(insertError)
          setSavedMessage('Erro ao criar ficha inicial')
        } else {
          const created = normalizeNpcRow(inserted)
          setNpcs([created])
          setActiveNpcId(created.id)
        }
      }

      initialLoadDone.current = true
      setDataLoading(false)
    }

    loadNpcs()
  }, [user])

  const data = useMemo(
    () => npcs.find((npc) => npc.id === activeNpcId) || npcs[0] || null,
    [npcs, activeNpcId]
  )

  const filteredNpcs = useMemo(() => {
    return npcs.filter((npc) => {
      const matchesSearch = [npc.nome, npc.equipe, npc.classe, npc.trilha]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesElement =
        elementFilter === 'todos' || npc.elementoPrincipal === elementFilter

      return matchesSearch && matchesElement
    })
  }, [npcs, searchTerm, elementFilter])

  const persistNpc = async (npc) => {
    if (!user || !npc) return false

    const payload = {
      nome: npc.nome || 'NPC sem nome',
      data: serializeNpcForDb(npc),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('npcs')
      .update(payload)
      .eq('id', npc.id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao salvar ficha: ${error.message}`)
      return false
    }

    return true
  }

  useEffect(() => {
    if (!initialLoadDone.current || !user || !data || sidebarTab !== 'banco') return

    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current)
    }

    autosaveTimeout.current = setTimeout(async () => {
      setIsSaving(true)
      const ok = await persistNpc(data)
      if (ok) {
        setSavedMessage('Ficha salva na nuvem')
        setTimeout(() => setSavedMessage(''), 1600)
      }
      setIsSaving(false)
    }, 700)

    return () => {
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current)
      }
    }
  }, [data, user, sidebarTab])

  const updateNpc = (updater) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== (activeNpcId || prev[0]?.id)) return npc
        const updated =
          typeof updater === 'function' ? updater(npc) : { ...npc, ...updater }
        return { ...updated, updatedAt: Date.now() }
      })
    )
  }

  const handleChange = (field, value) => {
    updateNpc((npc) => ({ ...npc, [field]: value }))
  }

  const toggleSecondaryElement = (element) => {
    updateNpc((npc) => ({
      ...npc,
      elementosSecundarios: npc.elementosSecundarios.includes(element)
        ? npc.elementosSecundarios.filter((item) => item !== element)
        : [...npc.elementosSecundarios, element],
    }))
  }

  const handleAttackChange = (index, field, value) => {
    updateNpc((npc) => ({
      ...npc,
      ataques: npc.ataques.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addAttack = () => {
    updateNpc((npc) => ({
      ...npc,
      ataques: [
        ...(npc.ataques || []),
        { nome: '', teste: '', dano: '', extra: '' },
      ],
    }))
  }

  const removeAttack = (index) => {
    updateNpc((npc) => {
      const next = npc.ataques.filter((_, i) => i !== index)
      return {
        ...npc,
        ataques: next.length
          ? next
          : [{ nome: '', teste: '', dano: '', extra: '' }],
      }
    })
  }

  const handleComplexItemChange = (listName, index, field, value) => {
    updateNpc((npc) => {
      const newList = npc[listName].map((item, i) => {
        if (i !== index) {
          return typeof item === 'string'
            ? { nome: item, descricao: '' }
            : item
        }
        const current =
          typeof item === 'string' ? { nome: item, descricao: '' } : item
        return { ...current, [field]: value }
      })

      return { ...npc, [listName]: newList }
    })
  }

  const addComplexItem = (listName) => {
    updateNpc((npc) => ({
      ...npc,
      [listName]: [...(npc[listName] || []), { nome: '', descricao: '' }],
    }))
  }

  const removeListItem = (field, index) => {
    updateNpc((npc) => {
      const next = npc[field].filter((_, i) => i !== index)
      return {
        ...npc,
        [field]: next.length ? next : [{ nome: '', descricao: '' }],
      }
    })
  }

  const toggleEntry = (key) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const saveAll = async () => {
    if (!user || !npcs.length) return

    setIsSaving(true)
    let failed = false

    for (const npc of npcs) {
      const ok = await persistNpc(npc)
      if (!ok) failed = true
    }

    setIsSaving(false)
    setSavedMessage(
      failed ? 'Algumas fichas não puderam ser salvas' : 'Todas as fichas foram salvas'
    )
    setTimeout(() => setSavedMessage(''), 2500)
  }

  const createNpc = async () => {
    if (!user) return

    const fresh = createEmptyNpc()

    const { data: inserted, error } = await supabase
      .from('npcs')
      .insert({
        id: fresh.id,
        user_id: user.id,
        nome: fresh.nome || 'NPC sem nome',
        data: serializeNpcForDb(fresh),
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao criar ficha: ${error.message}`)
      setTimeout(() => setSavedMessage(''), 2500)
      return
    }

    const created = normalizeNpcRow(inserted)
    setNpcs((prev) => [created, ...prev])
    setActiveNpcId(created.id)
    setSavedMessage('Nova ficha criada')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  const duplicateNpc = async () => {
    if (!user || !data) return

    const copy = {
      ...data,
      id: crypto.randomUUID(),
      nome: data.nome ? `${data.nome} (cópia)` : 'NPC (cópia)',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    const { data: inserted, error } = await supabase
      .from('npcs')
      .insert({
        id: copy.id,
        user_id: user.id,
        nome: copy.nome || 'NPC sem nome',
        data: serializeNpcForDb(copy),
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao duplicar ficha: ${error.message}`)
      setTimeout(() => setSavedMessage(''), 2500)
      return
    }

    const created = normalizeNpcRow(inserted)
    setNpcs((prev) => [created, ...prev])
    setActiveNpcId(created.id)
    setSavedMessage('Ficha duplicada')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  const deleteNpc = async () => {
    if (!user || !data) return

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${data.nome || 'NPC sem nome'}"?`
    )
    if (!confirmed) return

    const { error } = await supabase
      .from('npcs')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao excluir ficha: ${error.message}`)
      setTimeout(() => setSavedMessage(''), 2500)
      return
    }

    const filtered = npcs.filter((npc) => npc.id !== data.id)

    if (filtered.length > 0) {
      setNpcs(filtered)
      setActiveNpcId(filtered[0]?.id || null)
    } else {
      const fresh = createEmptyNpc()

      const { data: inserted, error: insertError } = await supabase
        .from('npcs')
        .insert({
          id: fresh.id,
          user_id: user.id,
          nome: fresh.nome || 'NPC sem nome',
          data: serializeNpcForDb(fresh),
        })
        .select()
        .single()

      if (insertError) {
        console.error(insertError)
        setNpcs([])
        setActiveNpcId(null)
      } else {
        const created = normalizeNpcRow(inserted)
        setNpcs([created])
        setActiveNpcId(created.id)
      }
    }

    setSavedMessage('Ficha excluída')
    setTimeout(() => setSavedMessage(''), 2500)
  }

  const adjustStat = (field, delta, npcId = data?.id) => {
    setNpcs((prev) =>
      prev.map((npc) => {
        if (npc.id !== npcId) return npc
        const maxField =
          field === 'pvAtual' ? 'pv' : field === 'peAtual' ? 'pe' : 'sanidade'
        const maxValue = Number(npc[maxField] || 0)
        const current = Number(npc[field] || 0)
        const next = Math.max(
          0,
          maxValue ? Math.min(maxValue, current + delta) : current + delta
        )
        return { ...npc, [field]: String(next), updatedAt: Date.now() }
      })
    )
  }

  const handleTrackerDeltaChange = (npcId, field, value) => {
    setTrackerDeltas((prev) => ({
      ...prev,
      [npcId]: {
        ...(prev[npcId] || {}),
        [field]: value,
      },
    }))
  }

  const applyTrackerChange = async (npcId) => {
    const deltaConfig = trackerDeltas[npcId] || {}
    const targetNpc = npcs.find((npc) => npc.id === npcId)
    if (!targetNpc) return

    const updatedNpc = {
      ...targetNpc,
      pvAtual: clampResource(targetNpc.pvAtual, targetNpc.pv, deltaConfig.pv),
      peAtual: clampResource(targetNpc.peAtual, targetNpc.pe, deltaConfig.pe),
      sanidadeAtual: clampResource(
        targetNpc.sanidadeAtual,
        targetNpc.sanidade,
        deltaConfig.san
      ),
      updatedAt: Date.now(),
    }

    setNpcs((prev) =>
      prev.map((npc) => (npc.id === npcId ? updatedNpc : npc))
    )

    setTrackerDeltas((prev) => ({
      ...prev,
      [npcId]: { pv: '', pe: '', san: '' },
    }))

    setIsSaving(true)
    const ok = await persistNpc(updatedNpc)
    setIsSaving(false)

    if (ok) {
      setSavedMessage('Recursos atualizados')
      setTimeout(() => setSavedMessage(''), 1600)
    }
  }

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => handleChange('imagem', String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const resumoTopo = useMemo(() => {
    const parts = [data?.classe, data?.trilha].filter(Boolean)
    return parts.length ? parts.join(' • ') : 'Classe • Trilha'
  }, [data?.classe, data?.trilha])

  const formTabs = [
    { id: 'gerais', label: 'Informações gerais', icon: Shield },
    { id: 'habilidades', label: 'Habilidades', icon: WandSparkles },
    { id: 'rituais', label: 'Rituais', icon: BookOpen },
    { id: 'informacoes', label: 'Itens e infos', icon: StickyNote },
  ]

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Carregando...
      </div>
    )
  }

  if (!session) {
    return <AuthScreen />
  }

  if (dataLoading || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Carregando fichas...
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <style>{`
        *::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        *::-webkit-scrollbar-track {
          background: transparent;
        }
        *::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #52525b, #27272a);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        *::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #71717a, #3f3f46);
          border: 2px solid transparent;
          background-clip: padding-box;
        }
      `}</style>

      <div className="mx-auto grid h-screen max-w-[1900px] grid-cols-1 gap-6 p-4 xl:grid-cols-[340px_560px_minmax(0,1fr)] xl:p-6">
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
                onClick={handleSignOut}
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
            <p className="mt-2 text-xs text-zinc-500 break-all">{user.email}</p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2 shrink-0">
            <button
              onClick={createNpc}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500"
            >
              <Plus className="h-4 w-4" /> Novo
            </button>
            <button
              onClick={saveAll}
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500 disabled:opacity-60"
            >
              <Save className="h-4 w-4" /> Salvar
            </button>
            <button
              onClick={duplicateNpc}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500"
            >
              <Copy className="h-4 w-4" /> Duplicar
            </button>
            <button
              onClick={deleteNpc}
              className="rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-300 hover:border-red-700"
            >
              Excluir
            </button>
          </div>

          {savedMessage && (
            <div className="mb-4 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-300 shrink-0">
              {savedMessage}
            </div>
          )}

          <div className="mb-4 flex gap-2 shrink-0">
            <button
              onClick={() => setSidebarTab('banco')}
              className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold ${
                sidebarTab === 'banco'
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-300'
              }`}
            >
              Banco
            </button>
            <button
              onClick={() => setSidebarTab('controle')}
              className={`flex-1 rounded-2xl px-3 py-2 text-sm font-semibold ${
                sidebarTab === 'controle'
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-300'
              }`}
            >
              Controle
            </button>
          </div>

          <div className="mb-4 shrink-0 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                className={`${inputStyle} pl-10`}
                placeholder="Pesquisar NPC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="relative">
              <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <select
                className={`${inputStyle} pl-10`}
                value={elementFilter}
                onChange={(e) => setElementFilter(e.target.value)}
              >
                <option value="todos">Todos os elementos</option>
                {elementOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={`space-y-3 flex-1 min-h-0 ${scrollClass}`}>
            {filteredNpcs.length ? (
              filteredNpcs.map((npc) => (
                <NpcCardCompact
                  key={npc.id}
                  npc={npc}
                  isActive={npc.id === data.id}
                  onSelect={() => setActiveNpcId(npc.id)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-6 text-center text-sm text-zinc-500">
                Nenhum NPC encontrado.
              </div>
            )}
          </div>
        </aside>

        {sidebarTab === 'controle' ? (
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
                  Ajuste PV, PE e SAN sem abrir ficha por ficha.
                </p>
              </div>

              <div className={`flex-1 min-h-0 ${scrollClass}`}>
                <div className="grid auto-rows-[360px] gap-4 lg:grid-cols-2 2xl:grid-cols-3">
                  {filteredNpcs.map((npc) => {
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
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setActiveNpcId(npc.id)
                              setSidebarTab('banco')
                            }}
                            className="shrink-0 rounded-xl border border-zinc-800 px-3 py-2 text-xs hover:border-zinc-600"
                          >
                            Abrir ficha
                          </button>
                        </div>

                        <div className="grid grid-cols-3 gap-3 shrink-0">
                          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4">
                            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                              PV atual
                            </div>
                            <div className="mt-1 text-2xl font-black text-white">
                              {npc.pvAtual || '0'}
                              <span className="text-sm text-zinc-500">/{npc.pv || '0'}</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4">
                            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                              PE atual
                            </div>
                            <div className="mt-1 text-2xl font-black text-white">
                              {npc.peAtual || '0'}
                              <span className="text-sm text-zinc-500">/{npc.pe || '0'}</span>
                            </div>
                          </div>

                          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-4">
                            <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                              SAN atual
                            </div>
                            <div className="mt-1 text-2xl font-black text-white">
                              {npc.sanidadeAtual || '0'}
                              <span className="text-sm text-zinc-500">/{npc.sanidade || '0'}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 md:grid-cols-3 shrink-0">
                          <input
                            className={inputStyle}
                            placeholder="PV: -5 ou +3"
                            value={deltas.pv || ''}
                            onChange={(e) =>
                              handleTrackerDeltaChange(npc.id, 'pv', e.target.value)
                            }
                          />
                          <input
                            className={inputStyle}
                            placeholder="PE: -2 ou +4"
                            value={deltas.pe || ''}
                            onChange={(e) =>
                              handleTrackerDeltaChange(npc.id, 'pe', e.target.value)
                            }
                          />
                          <input
                            className={inputStyle}
                            placeholder="SAN: -1 ou +2"
                            value={deltas.san || ''}
                            onChange={(e) =>
                              handleTrackerDeltaChange(npc.id, 'san', e.target.value)
                            }
                          />
                        </div>

                        <div className="mt-4 flex-1 min-h-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                          <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                            Resumo
                          </div>
                          <div className={`h-full text-sm text-zinc-300 ${scrollClass}`}>
                            <div><strong className="text-white">Equipe:</strong> {npc.equipe || '—'}</div>
                            <div><strong className="text-white">Elemento:</strong> {npc.elementoPrincipal || '—'}</div>
                            <div><strong className="text-white">Defesa:</strong> {npc.defesa || '—'}</div>
                            <div><strong className="text-white">Esquiva:</strong> {npc.esquiva || '—'}</div>
                            <div><strong className="text-white">Bloqueio:</strong> {npc.bloqueio || '—'}</div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => applyTrackerChange(npc.id)}
                          className="mt-4 w-full rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold hover:border-zinc-500 shrink-0"
                        >
                          Aplicar alteração
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </main>
        ) : (
          <>
            <aside className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur flex flex-col h-full min-h-0 overflow-hidden">
              <div className="mb-5 flex flex-wrap gap-3 shrink-0">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
                  <ImagePlus className="h-4 w-4" /> Imagem
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>

                <div className="inline-flex items-center rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-zinc-400">
                  {isSaving ? 'Sincronizando...' : 'Autosave ativo'}
                </div>
              </div>

              <div className="mb-5 grid grid-cols-3 gap-3 shrink-0">
                <StatQuickAdjust
                  icon={Heart}
                  label="PV"
                  current={data.pvAtual}
                  max={data.pv}
                  onAdjust={(delta) => adjustStat('pvAtual', delta)}
                />
                <StatQuickAdjust
                  icon={Zap}
                  label="PE"
                  current={data.peAtual}
                  max={data.pe}
                  onAdjust={(delta) => adjustStat('peAtual', delta)}
                />
                <StatQuickAdjust
                  icon={Brain}
                  label="Sanidade"
                  current={data.sanidadeAtual}
                  max={data.sanidade}
                  onAdjust={(delta) => adjustStat('sanidadeAtual', delta)}
                />
              </div>

              <div className="mb-4 flex flex-wrap gap-2 shrink-0">
                {formTabs.map((tab) => {
                  const Icon = tab.icon
                  const active = formTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFormTab(tab.id)}
                      className={`${tabButtonStyle} ${
                        active
                          ? 'bg-white text-black'
                          : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" /> {tab.label}
                    </button>
                  )
                })}
              </div>

              <div className={`space-y-6 flex-1 min-h-0 pb-10 ${scrollClass}`}>
                {formTab === 'gerais' && (
                  <>
                    <div>
                      <SectionTitle>Identificação</SectionTitle>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <Field
                          label="Nome"
                          value={data.nome}
                          onChange={(e) => handleChange('nome', e.target.value)}
                        />
                        <Field
                          label="Equipe"
                          value={data.equipe}
                          onChange={(e) => handleChange('equipe', e.target.value)}
                        />
                        <Field
                          label="Origem"
                          value={data.origem}
                          onChange={(e) => handleChange('origem', e.target.value)}
                        />
                        <Field
                          label="Classe"
                          value={data.classe}
                          onChange={(e) => handleChange('classe', e.target.value)}
                        />
                        <Field
                          label="Trilha"
                          value={data.trilha}
                          onChange={(e) => handleChange('trilha', e.target.value)}
                        />
                        <Field
                          label="NEX"
                          value={data.nex}
                          onChange={(e) => handleChange('nex', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Elementos</SectionTitle>
                      <div className="grid grid-cols-1 gap-3">
                        <label className="space-y-2">
                          <div className={labelStyle}>Elemento principal</div>
                          <select
                            className={inputStyle}
                            value={data.elementoPrincipal}
                            onChange={(e) =>
                              handleChange('elementoPrincipal', e.target.value)
                            }
                          >
                            {elementOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <SecondaryElementPicker
                          selected={data.elementosSecundarios}
                          onToggle={toggleSecondaryElement}
                        />
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Recursos e defesa</SectionTitle>
                      <div className="grid grid-cols-2 gap-3">
                        <Field
                          label="PV"
                          value={data.pv}
                          onChange={(e) => handleChange('pv', e.target.value)}
                        />
                        <Field
                          label="PV atual"
                          value={data.pvAtual}
                          onChange={(e) => handleChange('pvAtual', e.target.value)}
                        />
                        <Field
                          label="PE"
                          value={data.pe}
                          onChange={(e) => handleChange('pe', e.target.value)}
                        />
                        <Field
                          label="PE atual"
                          value={data.peAtual}
                          onChange={(e) => handleChange('peAtual', e.target.value)}
                        />
                        <Field
                          label="Sanidade"
                          value={data.sanidade}
                          onChange={(e) => handleChange('sanidade', e.target.value)}
                        />
                        <Field
                          label="Sanidade atual"
                          value={data.sanidadeAtual}
                          onChange={(e) =>
                            handleChange('sanidadeAtual', e.target.value)
                          }
                        />
                        <Field
                          label="Defesa"
                          value={data.defesa}
                          onChange={(e) => handleChange('defesa', e.target.value)}
                        />
                        <Field
                          label="Esquiva"
                          value={data.esquiva}
                          onChange={(e) => handleChange('esquiva', e.target.value)}
                        />
                        <Field
                          label="Bloqueio"
                          value={data.bloqueio}
                          onChange={(e) => handleChange('bloqueio', e.target.value)}
                        />
                        <Field
                          label="Deslocamento"
                          value={data.deslocamento}
                          onChange={(e) =>
                            handleChange('deslocamento', e.target.value)
                          }
                        />
                        <Field
                          label="Fortitude"
                          value={data.fortitude}
                          onChange={(e) =>
                            handleChange('fortitude', e.target.value)
                          }
                        />
                        <Field
                          label="Reflexos"
                          value={data.reflexos}
                          onChange={(e) => handleChange('reflexos', e.target.value)}
                        />
                        <Field
                          label="Vontade"
                          value={data.vontade}
                          onChange={(e) => handleChange('vontade', e.target.value)}
                        />
                        <Field
                          label="Iniciativa"
                          value={data.iniciativa}
                          onChange={(e) =>
                            handleChange('iniciativa', e.target.value)
                          }
                        />
                        <Field
                          label="Percepção"
                          value={data.percepcao}
                          onChange={(e) =>
                            handleChange('percepcao', e.target.value)
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Atributos</SectionTitle>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          ['agi', 'AGI'],
                          ['forca', 'FOR'],
                          ['int', 'INT'],
                          ['pre', 'PRE'],
                          ['vig', 'VIG'],
                        ].map(([key, label]) => (
                          <label key={key} className="space-y-2">
                            <div className={`${labelStyle} text-center`}>
                              {label}
                            </div>
                            <input
                              type="number"
                              className={`${inputStyle} text-center`}
                              value={data[key]}
                              onChange={(e) => handleChange(key, e.target.value)}
                            />
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Combate</SectionTitle>
                      <TextBlock
                        label="Perícias"
                        value={data.pericias}
                        onChange={(e) => handleChange('pericias', e.target.value)}
                        placeholder="Ex.: Investigação +10, Ocultismo +12, Vontade +9"
                        rows={6}
                      />
                      <TextBlock
                        label="Resistências"
                        value={data.resistencias}
                        onChange={(e) =>
                          handleChange('resistencias', e.target.value)
                        }
                        rows={4}
                      />
                      <TextBlock
                        label="Vulnerabilidades"
                        value={data.vulnerabilidades}
                        onChange={(e) =>
                          handleChange('vulnerabilidades', e.target.value)
                        }
                        rows={4}
                      />
                      <TextBlock
                        label="Imunidades"
                        value={data.imunidades}
                        onChange={(e) =>
                          handleChange('imunidades', e.target.value)
                        }
                        rows={4}
                      />
                    </div>

                    <div>
                      <SectionTitle>Ataques</SectionTitle>
                      <div className="space-y-3">
                        {(data.ataques || []).map((ataque, index) => (
                          <div
                            key={index}
                            className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 p-3 md:grid-cols-2"
                          >
                            <div className="md:col-span-2 flex justify-end">
                              <button
                                type="button"
                                onClick={() => removeAttack(index)}
                                className="rounded-2xl border border-zinc-800 px-3 py-2 hover:border-zinc-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            <Field
                              label="Ataque"
                              value={ataque.nome}
                              onChange={(e) =>
                                handleAttackChange(index, 'nome', e.target.value)
                              }
                            />
                            <Field
                              label="Teste"
                              value={ataque.teste}
                              onChange={(e) =>
                                handleAttackChange(index, 'teste', e.target.value)
                              }
                            />
                            <Field
                              label="Dano"
                              value={ataque.dano}
                              onChange={(e) =>
                                handleAttackChange(index, 'dano', e.target.value)
                              }
                            />
                            <Field
                              label="Crítico / Alcance / Especial"
                              value={ataque.extra}
                              onChange={(e) =>
                                handleAttackChange(index, 'extra', e.target.value)
                              }
                            />
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={addAttack}
                          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
                        >
                          <Plus className="h-4 w-4" /> Adicionar ataque
                        </button>
                      </div>
                    </div>

                    <div>
                      <SectionTitle>Imagem</SectionTitle>
                      {data.imagem ? (
                        <div className="overflow-hidden rounded-[24px] border border-zinc-800 bg-zinc-950">
                          <img
                            src={data.imagem}
                            alt={data.nome || 'NPC'}
                            className="h-64 w-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="flex h-64 items-center justify-center rounded-[24px] border border-dashed border-zinc-700 bg-zinc-950 text-sm text-zinc-500">
                          Sem imagem carregada
                        </div>
                      )}
                    </div>
                  </>
                )}

                {formTab === 'habilidades' && (
                  <>
                    <SectionTitle>Habilidades</SectionTitle>
                    <div className="space-y-4">
                      {(data.habilidades || []).map((item, index) => {
                        const hab =
                          typeof item === 'string'
                            ? { nome: item, descricao: '' }
                            : item
                        const key = `habilidades-edit-${index}`

                        return (
                          <CollapsibleEntry
                            key={key}
                            title={hab.nome || `Habilidade ${index + 1}`}
                            expanded={!!expandedEntries[key]}
                            onToggle={() => toggleEntry(key)}
                            onRemove={() => removeListItem('habilidades', index)}
                            danger
                          >
                            <div className="space-y-3">
                              <input
                                className={inputStyle}
                                value={hab.nome}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'habilidades',
                                    index,
                                    'nome',
                                    e.target.value
                                  )
                                }
                                placeholder={`Nome da Habilidade ${index + 1}`}
                              />
                              <textarea
                                className={textareaStyle}
                                value={hab.descricao}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'habilidades',
                                    index,
                                    'descricao',
                                    e.target.value
                                  )
                                }
                                placeholder="Descrição da habilidade..."
                                rows={4}
                              />
                            </div>
                          </CollapsibleEntry>
                        )
                      })}

                      <button
                        onClick={() => addComplexItem('habilidades')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
                      >
                        <Plus className="h-4 w-4" /> Adicionar habilidade
                      </button>
                    </div>

                    <div className="mt-8">
                      <TextBlock
                        label="Anotações gerais de habilidades (Opcional)"
                        value={data.habilidadesNotas}
                        onChange={(e) =>
                          handleChange('habilidadesNotas', e.target.value)
                        }
                        rows={6}
                      />
                    </div>
                  </>
                )}

                {formTab === 'rituais' && (
                  <>
                    <SectionTitle>Rituais</SectionTitle>
                    <div className="space-y-4">
                      {(data.rituais || []).map((item, index) => {
                        const ritual =
                          typeof item === 'string'
                            ? { nome: item, descricao: '' }
                            : item
                        const key = `rituais-edit-${index}`

                        return (
                          <CollapsibleEntry
                            key={key}
                            title={ritual.nome || `Ritual ${index + 1}`}
                            expanded={!!expandedEntries[key]}
                            onToggle={() => toggleEntry(key)}
                            onRemove={() => removeListItem('rituais', index)}
                            danger
                          >
                            <div className="space-y-3">
                              <input
                                className={inputStyle}
                                value={ritual.nome}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'rituais',
                                    index,
                                    'nome',
                                    e.target.value
                                  )
                                }
                                placeholder={`Nome do Ritual ${index + 1}`}
                              />
                              <textarea
                                className={textareaStyle}
                                value={ritual.descricao}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'rituais',
                                    index,
                                    'descricao',
                                    e.target.value
                                  )
                                }
                                placeholder="Descrição do ritual..."
                                rows={4}
                              />
                            </div>
                          </CollapsibleEntry>
                        )
                      })}

                      <button
                        onClick={() => addComplexItem('rituais')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
                      >
                        <Plus className="h-4 w-4" /> Adicionar ritual
                      </button>
                    </div>

                    <div className="mt-8">
                      <TextBlock
                        label="Anotações gerais de rituais (Opcional)"
                        value={data.rituaisNotas}
                        onChange={(e) => handleChange('rituaisNotas', e.target.value)}
                        rows={6}
                      />
                    </div>
                  </>
                )}

                {formTab === 'informacoes' && (
                  <>
                    <SectionTitle>Itens</SectionTitle>
                    <div className="space-y-4">
                      {(data.itens || []).map((item, index) => {
                        const objItem =
                          typeof item === 'string'
                            ? { nome: item, descricao: '' }
                            : item
                        const key = `itens-edit-${index}`

                        return (
                          <CollapsibleEntry
                            key={key}
                            title={objItem.nome || `Item ${index + 1}`}
                            expanded={!!expandedEntries[key]}
                            onToggle={() => toggleEntry(key)}
                            onRemove={() => removeListItem('itens', index)}
                            danger
                          >
                            <div className="space-y-3">
                              <input
                                className={inputStyle}
                                value={objItem.nome}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'itens',
                                    index,
                                    'nome',
                                    e.target.value
                                  )
                                }
                                placeholder={`Nome do Item ${index + 1}`}
                              />
                              <textarea
                                className={textareaStyle}
                                value={objItem.descricao}
                                onChange={(e) =>
                                  handleComplexItemChange(
                                    'itens',
                                    index,
                                    'descricao',
                                    e.target.value
                                  )
                                }
                                placeholder="Descrição do item..."
                                rows={4}
                              />
                            </div>
                          </CollapsibleEntry>
                        )
                      })}

                      <button
                        onClick={() => addComplexItem('itens')}
                        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
                      >
                        <Plus className="h-4 w-4" /> Adicionar item
                      </button>
                    </div>

                    <div className="mt-8 space-y-6">
                      <TextBlock
                        label="Anotações gerais de itens (Opcional)"
                        value={data.itensNotas}
                        onChange={(e) => handleChange('itensNotas', e.target.value)}
                        rows={4}
                      />
                      <TextBlock
                        label="Aparência"
                        value={data.aparencia}
                        onChange={(e) => handleChange('aparencia', e.target.value)}
                        rows={6}
                      />
                      <TextBlock
                        label="História"
                        value={data.historia}
                        onChange={(e) => handleChange('historia', e.target.value)}
                        rows={10}
                      />
                      <TextBlock
                        label="Anotações gerais"
                        value={data.anotacoesGerais}
                        onChange={(e) =>
                          handleChange('anotacoesGerais', e.target.value)
                        }
                        rows={8}
                      />
                      <TextBlock
                        label="Informações extras"
                        value={data.informacoesGerais}
                        onChange={(e) =>
                          handleChange('informacoesGerais', e.target.value)
                        }
                        rows={8}
                      />
                    </div>
                  </>
                )}
              </div>
            </aside>

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

                {previewTab === 'rapida' && (
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
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                  PV
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                  {data.pvAtual || '0'}/{data.pv || '0'}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                  PE
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                  {data.peAtual || '0'}/{data.pe || '0'}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                  SAN
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                  {data.sanidadeAtual || '0'}/{data.sanidade || '0'}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                  DEF
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                  {data.defesa || '0'}
                                </div>
                              </div>
                              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3">
                                <div className="text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                                  ESQ / BLQ
                                </div>
                                <div className="mt-1 text-lg font-black text-white">
                                  {data.esquiva || '—'} / {data.bloqueio || '—'}
                                </div>
                              </div>
                            </div>

                            <div className="mt-6 grid gap-4 md:grid-cols-2">
                              <PreviewBox title="Informações básicas">
                                <div className="space-y-2 text-sm text-zinc-300">
                                  <div>
                                    <strong className="text-white">Equipe:</strong>{' '}
                                    {data.equipe || '—'}
                                  </div>
                                  <div>
                                    <strong className="text-white">Origem:</strong>{' '}
                                    {data.origem || '—'}
                                  </div>
                                  <div>
                                    <strong className="text-white">Elemento:</strong>{' '}
                                    {data.elementoPrincipal || '—'}
                                  </div>
                                  <div>
                                    <strong className="text-white">Secundários:</strong>{' '}
                                    {data.elementosSecundarios?.length
                                      ? data.elementosSecundarios.join(', ')
                                      : '—'}
                                  </div>
                                  <div>
                                    <strong className="text-white">Percepção:</strong>{' '}
                                    {data.percepcao || '—'}
                                  </div>
                                  <div>
                                    <strong className="text-white">Iniciativa:</strong>{' '}
                                    {data.iniciativa || '—'}
                                  </div>
                                </div>
                              </PreviewBox>

                              <PreviewBox title="Atributos">
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
                          expandedEntries={expandedEntries}
                          toggleEntry={toggleEntry}
                          emptyText="Nenhuma habilidade adicionada."
                        />
                      </PreviewBox>
                    </div>
                  </div>
                )}

                {previewTab === 'completa' && (
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
                              <div><strong className="text-white">Nome:</strong> {data.nome || '—'}</div>
                              <div><strong className="text-white">Equipe:</strong> {data.equipe || '—'}</div>
                              <div><strong className="text-white">Origem:</strong> {data.origem || '—'}</div>
                              <div><strong className="text-white">Classe:</strong> {data.classe || '—'}</div>
                              <div><strong className="text-white">Trilha:</strong> {data.trilha || '—'}</div>
                              <div><strong className="text-white">NEX:</strong> {data.nex || '0'}%</div>
                            </div>
                          </PreviewBox>

                          <PreviewBox title="Recursos e defesa">
                            <div className="grid gap-3 text-sm text-zinc-300 md:grid-cols-3">
                              <div><strong className="text-white">PV:</strong> {data.pvAtual || '0'}/{data.pv || '0'}</div>
                              <div><strong className="text-white">PE:</strong> {data.peAtual || '0'}/{data.pe || '0'}</div>
                              <div><strong className="text-white">Sanidade:</strong> {data.sanidadeAtual || '0'}/{data.sanidade || '0'}</div>
                              <div><strong className="text-white">Defesa:</strong> {data.defesa || '—'}</div>
                              <div><strong className="text-white">Esquiva:</strong> {data.esquiva || '—'}</div>
                              <div><strong className="text-white">Bloqueio:</strong> {data.bloqueio || '—'}</div>
                              <div><strong className="text-white">Fortitude:</strong> {data.fortitude || '—'}</div>
                              <div><strong className="text-white">Reflexos:</strong> {data.reflexos || '—'}</div>
                              <div><strong className="text-white">Vontade:</strong> {data.vontade || '—'}</div>
                              <div><strong className="text-white">Deslocamento:</strong> {data.deslocamento || '—'}</div>
                              <div><strong className="text-white">Iniciativa:</strong> {data.iniciativa || '—'}</div>
                              <div><strong className="text-white">Percepção:</strong> {data.percepcao || '—'}</div>
                            </div>
                          </PreviewBox>

                          <PreviewBox title="Elementos e atributos">
                            <div className="space-y-4 text-sm text-zinc-300">
                              <div>
                                <strong className="text-white">Elemento principal:</strong>{' '}
                                {data.elementoPrincipal || '—'}
                              </div>
                              <div>
                                <strong className="text-white">Elementos secundários:</strong>{' '}
                                {data.elementosSecundarios?.length
                                  ? data.elementosSecundarios.join(', ')
                                  : '—'}
                              </div>
                              <div className="grid grid-cols-5 gap-2 text-center">
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
                          <div>
                            <div className="mb-2 font-black text-white">Resistências</div>
                            <div className="whitespace-pre-wrap">{data.resistencias || '—'}</div>
                          </div>
                          <div>
                            <div className="mb-2 font-black text-white">Vulnerabilidades</div>
                            <div className="whitespace-pre-wrap">{data.vulnerabilidades || '—'}</div>
                          </div>
                          <div>
                            <div className="mb-2 font-black text-white">Imunidades</div>
                            <div className="whitespace-pre-wrap">{data.imunidades || '—'}</div>
                          </div>
                        </div>
                      </PreviewBox>

                      <PreviewBox title="Ataques">
                        <AttackPreviewList attacks={data.ataques} />
                      </PreviewBox>

                      <PreviewBox title="Habilidades">
                        <CollapsiblePreviewList
                          items={data.habilidades}
                          sectionKey="preview-completa-habilidades"
                          expandedEntries={expandedEntries}
                          toggleEntry={toggleEntry}
                          emptyText="Nenhuma habilidade adicionada."
                        />
                        {data.habilidadesNotas ? (
                          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Anotações de habilidades
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-zinc-300">
                              {data.habilidadesNotas}
                            </div>
                          </div>
                        ) : null}
                      </PreviewBox>

                      <PreviewBox title="Rituais">
                        <CollapsiblePreviewList
                          items={data.rituais}
                          sectionKey="preview-completa-rituais"
                          expandedEntries={expandedEntries}
                          toggleEntry={toggleEntry}
                          emptyText="Nenhum ritual adicionado."
                        />
                        {data.rituaisNotas ? (
                          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Anotações de rituais
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-zinc-300">
                              {data.rituaisNotas}
                            </div>
                          </div>
                        ) : null}
                      </PreviewBox>

                      <PreviewBox title="Itens">
                        <CollapsiblePreviewList
                          items={data.itens}
                          sectionKey="preview-completa-itens"
                          expandedEntries={expandedEntries}
                          toggleEntry={toggleEntry}
                          emptyText="Nenhum item adicionado."
                        />
                        {data.itensNotas ? (
                          <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <div className="mb-2 text-xs uppercase tracking-[0.22em] text-zinc-500">
                              Anotações de itens
                            </div>
                            <div className="whitespace-pre-wrap text-sm text-zinc-300">
                              {data.itensNotas}
                            </div>
                          </div>
                        ) : null}
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
                )}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  )
}