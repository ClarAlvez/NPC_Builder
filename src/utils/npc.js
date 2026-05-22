import { createEmptyNpc } from '../models/npc'

export function normalizeNpc(npc = {}) {
  const base = createEmptyNpc()

  const normalized = {
    ...base,
    ...npc,

    visibleInControl:
      typeof npc.visibleInControl === 'boolean'
        ? npc.visibleInControl
        : true,

    ataques:
      Array.isArray(npc.ataques) && npc.ataques.length
        ? npc.ataques.map((ataque) => ({
            nome: '',
            teste: '',
            dano: '',
            danoMedio: '',
            danoCritico: '',
            extra: '',
            ...ataque,
          }))
        : base.ataques,

    habilidades:
      Array.isArray(npc.habilidades) && npc.habilidades.length
        ? npc.habilidades.map((habilidade) => ({
            nome: '',
            descricao: '',
            ...habilidade,
          }))
        : base.habilidades,

    itens:
      Array.isArray(npc.itens) && npc.itens.length
        ? npc.itens.map((item) => ({
            nome: '',
            descricao: '',
            ...item,
          }))
        : base.itens,

    rituais:
      Array.isArray(npc.rituais) && npc.rituais.length
        ? npc.rituais.map((ritual) => ({
            nome: '',
            descricao: '',
            dano: '',
            ...ritual,
          }))
        : base.rituais,
  }

  delete normalized.elementosSecundarios

  return normalized
}

export function normalizeNpcRow(row) {
  return normalizeNpc({
    ...(row.data || {}),
    id: row.id,
  })
}

export function serializeNpcForDb(npc) {
  const clean = { ...npc }

  delete clean.elementosSecundarios

  return clean
}

export function getTeamOptions(npcs) {
  return Array.from(
    new Set(
      npcs
        .map((npc) => npc.equipe?.trim())
        .filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
}