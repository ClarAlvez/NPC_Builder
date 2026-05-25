import { createEmptyNpc } from '../models/npc'

export function normalizeNpc(npc = {}) {
  const base = createEmptyNpc()

  const normalized = {
  ...base,
  ...npc,

  dtRitual: npc.dtRitual || '',

  pericias: normalizePericias(npc.pericias),

  visibleInControl:
    typeof npc.visibleInControl === 'boolean'
      ? npc.visibleInControl
      : true,

  ataques:
  Array.isArray(npc.ataques) && npc.ataques.length
    ? npc.ataques.map((ataque) => ({
        nome: '',
        custoPe: '',
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
    ? npc.habilidades.map((habilidade) => {
        if (typeof habilidade === 'string') {
          return {
            nome: habilidade,
            custoPe: '',
            descricao: '',
          }
        }

        return {
          nome: '',
          custoPe: '',
          descricao: '',
          ...habilidade,
        }
      })
    : base.habilidades,

    rituais:
  Array.isArray(npc.rituais) && npc.rituais.length
    ? npc.rituais.map((ritual) => {
        if (typeof ritual === 'string') {
          return {
            nome: ritual,
            custoPe: '',
            descricao: '',
            dano: '',
          }
        }

        return {
          nome: '',
          custoPe: '',
          descricao: '',
          dano: '',
          ...ritual,
        }
      })
    : base.rituais,
  }

  delete normalized.elementosSecundarios

  return normalized
}

function normalizePericias(pericias) {
  if (Array.isArray(pericias) && pericias.length) {
    return pericias.map((pericia) => {
      if (typeof pericia === 'string') {
        return {
          nome: pericia,
          teste: '',
        }
      }

      return {
        nome: '',
        teste: '',
        ...pericia,
      }
    })
  }

  if (typeof pericias === 'string' && pericias.trim()) {
    return pericias
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split(/[:|-]/)
        const nome = parts[0]?.trim() || line
        const teste = parts.slice(1).join(' ').trim()

        return {
          nome,
          teste,
        }
      })
  }

  return [{ nome: '', teste: '' }]
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