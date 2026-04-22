import { supabase } from '../lib/supabase'

export async function fetchNpcs(userId) {
  const { data, error } = await supabase
    .from('npcs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return data.map((row) => ({
    id: row.id,
    ...row.data,
    nome: row.nome ?? row.data?.nome ?? '',
  }))
}

export async function createNpc(userId, npc) {
  const payload = {
    user_id: userId,
    nome: npc.nome || 'NPC sem nome',
    data: npc,
  }

  const { data, error } = await supabase
    .from('npcs')
    .insert(payload)
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    ...data.data,
    nome: data.nome ?? data.data?.nome ?? '',
  }
}

export async function updateNpc(userId, npc) {
  const payload = {
    user_id: userId,
    nome: npc.nome || 'NPC sem nome',
    data: npc,
  }

  const { error } = await supabase
    .from('npcs')
    .update(payload)
    .eq('id', npc.id)
    .eq('user_id', userId)

  if (error) throw error
}

export async function deleteNpc(userId, npcId) {
  const { error } = await supabase
    .from('npcs')
    .delete()
    .eq('id', npcId)
    .eq('user_id', userId)

  if (error) throw error
}