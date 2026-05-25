import { useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { createEmptyNpc } from '../models/npc'
import {
  getTeamOptions,
  normalizeNpcRow,
  serializeNpcForDb,
} from '../utils/npc'
import { clampResource } from '../utils/resources'
import { parseRollemLikeInput } from '../utils/dice'

export function useNpcManager(user, sidebarTab) {
  const [npcs, setNpcs] = useState([])
  const [activeNpcId, setActiveNpcId] = useState(null)

  const [savedMessage, setSavedMessage] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [elementFilter, setElementFilter] = useState('todos')
  const [teamFilter, setTeamFilter] = useState('todas')

  const [trackerDeltas, setTrackerDeltas] = useState({})
  const [expandedEntries, setExpandedEntries] = useState({})

  const [diceHistory, setDiceHistory] = useState([])
  const [sheetRollsByNpc, setSheetRollsByNpc] = useState({})
  const [rollToast, setRollToast] = useState(null)

  const initialLoadDone = useRef(false)
  const autosaveTimeout = useRef(null)

  const data = useMemo(
    () => npcs.find((npc) => npc.id === activeNpcId) || npcs[0] || null,
    [npcs, activeNpcId]
  )

  const activeSheetRolls = useMemo(() => {
    if (!data?.id) return []
    return sheetRollsByNpc[data.id] || []
  }, [sheetRollsByNpc, data?.id])

  const teamOptions = useMemo(() => getTeamOptions(npcs), [npcs])

  const filteredNpcs = useMemo(() => {
    return npcs.filter((npc) => {
      const matchesSearch = [npc.nome, npc.equipe, npc.classe, npc.trilha]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesElement =
        elementFilter === 'todos' || npc.elementoPrincipal === elementFilter

      const matchesTeam = teamFilter === 'todas' || npc.equipe === teamFilter

      return matchesSearch && matchesElement && matchesTeam
    })
  }, [npcs, searchTerm, elementFilter, teamFilter])

  const visibleControlNpcs = useMemo(() => {
    return filteredNpcs.filter((npc) => npc.visibleInControl !== false)
  }, [filteredNpcs])

  useEffect(() => {
    async function loadNpcs() {
      if (!user) {
        setNpcs([])
        setActiveNpcId(null)
        initialLoadDone.current = false
        return
      }

      setDataLoading(true)

      const { data: rows, error } = await supabase
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

      if (rows && rows.length > 0) {
        const mapped = rows.map(normalizeNpcRow)
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
    if (!initialLoadDone.current || !user || !data || sidebarTab !== 'banco') {
      return
    }

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

        return {
          ...updated,
          updatedAt: Date.now(),
        }
      })
    )
  }

  const handleChange = (field, value) => {
    updateNpc((npc) => ({
      ...npc,
      [field]: value,
    }))
  }

  const createNpc = async () => {
    if (!user) return

    const fresh = createEmptyNpc()

    setIsSaving(true)

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

    setIsSaving(false)

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao criar NPC: ${error.message}`)
      setTimeout(() => setSavedMessage(''), 2500)
      return
    }

    const created = normalizeNpcRow(inserted)

    setNpcs((prev) => [created, ...prev])
    setActiveNpcId(created.id)

    setSavedMessage('Nova ficha criada')
    setTimeout(() => setSavedMessage(''), 1600)
  }

  const saveAll = async () => {
    if (!user || !npcs.length) return

    setIsSaving(true)

    for (const npc of npcs) {
      await persistNpc(npc)
    }

    setIsSaving(false)
    setSavedMessage('Todas as fichas foram salvas')
    setTimeout(() => setSavedMessage(''), 1600)
  }

  const duplicateNpc = async () => {
    if (!user || !data) return

    const duplicated = {
      ...data,
      id: crypto.randomUUID(),
      nome: `${data.nome || 'NPC sem nome'} cópia`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setIsSaving(true)

    const { data: inserted, error } = await supabase
      .from('npcs')
      .insert({
        id: duplicated.id,
        user_id: user.id,
        nome: duplicated.nome,
        data: serializeNpcForDb(duplicated),
      })
      .select()
      .single()

    setIsSaving(false)

    if (error) {
      console.error(error)
      setSavedMessage(`Erro ao duplicar NPC: ${error.message}`)
      setTimeout(() => setSavedMessage(''), 2500)
      return
    }

    const created = normalizeNpcRow(inserted)

    setNpcs((prev) => [created, ...prev])
    setActiveNpcId(created.id)

    setSavedMessage('Ficha duplicada')
    setTimeout(() => setSavedMessage(''), 1600)
  }

  const deleteNpc = async () => {
    if (!user || !data) return

    const confirmed = window.confirm(
      `Excluir "${data.nome || 'NPC sem nome'}"? Essa ação não pode ser desfeita.`
    )

    if (!confirmed) return

    setIsSaving(true)

    const { error } = await supabase
      .from('npcs')
      .delete()
      .eq('id', data.id)
      .eq('user_id', user.id)

    setIsSaving(false)

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
    setTimeout(() => setSavedMessage(''), 1600)
  }

  const handleAttackChange = (index, field, value) => {
    updateNpc((npc) => ({
      ...npc,
      ataques: npc.ataques.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const handleSkillChange = (index, field, value) => {
    updateNpc((npc) => ({
      ...npc,
      pericias: (npc.pericias || []).map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }))
  }

  const addSkill = () => {
    updateNpc((npc) => ({
      ...npc,
      pericias: [
        ...(Array.isArray(npc.pericias) ? npc.pericias : []),
        {
          nome: '',
          teste: '',
        },
      ],
    }))
  }

const removeSkill = (index) => {
  updateNpc((npc) => {
    const current = Array.isArray(npc.pericias) ? npc.pericias : []
    const next = current.filter((_, i) => i !== index)

    return {
      ...npc,
      pericias: next.length ? next : [{ nome: '', teste: '' }],
    }
  })
}

  const addAttack = () => {
    updateNpc((npc) => ({
      ...npc,
      ataques: [
        ...(npc.ataques || []),
        {
          nome: '',
          custoPe: '',
          teste: '',
          dano: '',
          danoMedio: '',
          danoCritico: '',
          extra: '',
        },
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
          : [
              {
                nome: '',
                custoPe: '',
                teste: '',
                dano: '',
                danoMedio: '',
                danoCritico: '',
                extra: '',
              }
            ],
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

        return {
          ...current,
          [field]: value,
        }
      })

      return {
        ...npc,
        [listName]: newList,
      }
    })
  }

  const addComplexItem = (listName) => {
  updateNpc((npc) => {
    let defaultItem = {
      nome: '',
      descricao: '',
    }

    if (listName === 'rituais') {
      defaultItem = {
        nome: '',
        custoPe: '',
        descricao: '',
        dano: '',
      }
    }

    if (listName === 'habilidades') {
      defaultItem = {
        nome: '',
        custoPe: '',
        descricao: '',
      }
    }

    return {
      ...npc,
      [listName]: [...(npc[listName] || []), defaultItem],
    }
  })
}

  const removeListItem = (field, index) => {
    updateNpc((npc) => {
      const next = npc[field].filter((_, i) => i !== index)

      let fallback = [{ nome: '', descricao: '' }]

      if (field === 'rituais') {
        fallback = [{ nome: '', custoPe: '', descricao: '', dano: '' }]
      }

      if (field === 'habilidades') {
        fallback = [{ nome: '', custoPe: '', descricao: '' }]
      }

      return {
        ...npc,
        [field]: next.length ? next : fallback,
      }
    })
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

        return {
          ...npc,
          [field]: String(next),
          updatedAt: Date.now(),
        }
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
      [npcId]: {
        pv: '',
        pe: '',
        san: '',
      },
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

    reader.onload = () => {
      handleChange('imagem', String(reader.result || ''))
    }

    reader.readAsDataURL(file)
  }

  const toggleEntry = (key) => {
    setExpandedEntries((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

const rollFromSheet = (command, label = 'Rolagem', npcId = data?.id) => {
  try {
    if (!npcId) {
      throw new Error('Nenhum NPC ativo para registrar a rolagem.')
    }

    const result = parseRollemLikeInput(command)

    const entry = {
      ...result,
      id: crypto.randomUUID(),
      npcId,
      input: `${label}: ${command}`,
      createdAt: new Date().toLocaleTimeString('pt-BR'),
    }

    setSheetRollsByNpc((prev) => ({
      ...prev,
      [npcId]: [entry, ...(prev[npcId] || [])].slice(0, 30),
    }))

    setDiceHistory((prev) => [entry, ...prev].slice(0, 30))

    setRollToast({
      id: crypto.randomUUID(),
      title: label,
      entry,
    })

    setSavedMessage(`Rolagem feita: ${label}`)
    setTimeout(() => setSavedMessage(''), 1600)
  } catch (err) {
    setSavedMessage(err.message || 'Erro ao rolar dados')
    setTimeout(() => setSavedMessage(''), 2500)
  }
}

  const closeRollToast = () => {
    setRollToast(null)
  }

  return {
    npcs,
    setNpcs,

    data,
    filteredNpcs,
    visibleControlNpcs,

    activeNpcId,
    setActiveNpcId,

    savedMessage,
    setSavedMessage,

    dataLoading,
    isSaving,

    searchTerm,
    setSearchTerm,

    elementFilter,
    setElementFilter,

    teamFilter,
    setTeamFilter,
    teamOptions,

    trackerDeltas,
    expandedEntries,

    diceHistory,
    setDiceHistory,

    sheetRollsByNpc,
    activeSheetRolls,

    createNpc,
    saveAll,
    duplicateNpc,
    deleteNpc,

    updateNpc,
    handleChange,

    handleAttackChange,
    addAttack,
    removeAttack,

    handleComplexItemChange,
    addComplexItem,
    removeListItem,

    adjustStat,

    handleTrackerDeltaChange,
    applyTrackerChange,

    handleImageUpload,

    toggleEntry,
    rollFromSheet,
    rollToast,
    closeRollToast,

    handleSkillChange,
    addSkill,
    removeSkill,
  }
}