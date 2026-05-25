export const elementOptions = [
  'Sangue',
  'Morte',
  'Energia',
  'Conhecimento',
  'Medo',
]

export const createEmptyNpc = () => ({
  id: crypto.randomUUID(),

  nome: '',
  equipe: '',

  origem: '',
  classe: '',
  trilha: '',
  nex: '0',

  elementoPrincipal: 'Sangue',

  visibleInControl: true,

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

  dtRitual: '',
  pericias: [{ nome: '', teste: '' }],

  aparencia: '',
  anotacoesGerais: '',
  historia: '',
  informacoesGerais: '',
  itensNotas: '',
  habilidadesNotas: '',
  rituaisNotas: '',

  imagem: '',

  ataques: [
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

  habilidades: [
    {
      nome: '',
      custoPe: '',
      descricao: '',
    },
  ],

  itens: [
    {
      nome: '',
      descricao: '',
    },
  ],

  rituais: [
    {
      nome: '',
      custoPe: '',
      descricao: '',
      dano: '',
    },
  ],

  agi: 0,
  forca: 0,
  int: 0,
  pre: 0,
  vig: 0,

  createdAt: Date.now(),
  updatedAt: Date.now(),
})