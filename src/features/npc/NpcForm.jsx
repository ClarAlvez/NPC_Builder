import { useMemo, useState } from 'react'
import {
  BookOpen,
  ImagePlus,
  LayoutPanelTop,
  StickyNote,
  Trash2,
  WandSparkles,
  Shield,
  Swords,
  Plus,
  History,
} from 'lucide-react'
import { elementOptions } from '../../models/npc'
import SectionTitle from '../../components/common/SectionTitle'
import { Field, TextBlock, inputStyle } from '../../components/common/Field'
import RollResultLine from '../../components/dice/RollResultLine'

const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

export default function NpcForm({ manager }) {
  const {
    data,
    isSaving,
    handleChange,
    adjustStat,
    handleAttackChange,
    addAttack,
    removeAttack,
    handleComplexItemChange,
    addComplexItem,
    removeListItem,
    handleImageUpload,
    rollFromSheet,
    sheetRolls,
    expandedEntries,
    toggleEntry,
    activeSheetRolls,
    handleSkillChange,
    addSkill,
    removeSkill,
  } = manager

  const [formTab, setFormTab] = useState('gerais')

  const resumoTopo = useMemo(() => {
    const parts = [data?.classe, data?.trilha].filter(Boolean)
    return parts.length ? parts.join(' • ') : 'Classe • Trilha'
  }, [data?.classe, data?.trilha])

  const formTabs = [
    { id: 'gerais', label: 'Gerais', icon: Shield },
    { id: 'ataques', label: 'Ataques', icon: Swords },
    { id: 'habilidades', label: 'Habilidades', icon: WandSparkles },
    { id: 'rituais', label: 'Rituais', icon: BookOpen },
    { id: 'informacoes', label: 'Itens e infos', icon: StickyNote },
    { id: 'rolagens', label: 'Rolagens', icon: History },
  ]

  return (
    <aside className="rounded-[28px] border border-zinc-800 bg-zinc-900/70 p-5 shadow-2xl backdrop-blur flex flex-col h-full min-h-0 overflow-hidden">
      <div className="mb-5 flex flex-wrap gap-3 shrink-0">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm font-semibold hover:border-zinc-500">
          <ImagePlus className="h-4 w-4" />
          Imagem
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

        <button
          type="button"
          onClick={() =>
            handleChange('visibleInControl', !data.visibleInControl)
          }
          className={`inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
            data.visibleInControl
              ? 'border-emerald-800/70 bg-emerald-950/30 text-emerald-300'
              : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:border-zinc-600'
          }`}
          title="Controla se este NPC aparece na aba Controle"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              data.visibleInControl ? 'bg-emerald-400' : 'bg-zinc-600'
            }`}
          />
          Controle
        </button>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3 shrink-0">
        <StatQuickAdjust
          label="PV"
          current={data.pvAtual}
          max={data.pv}
          onAdjust={(delta) => adjustStat('pvAtual', delta)}
        />

        <StatQuickAdjust
          label="PE"
          current={data.peAtual}
          max={data.pe}
          onAdjust={(delta) => adjustStat('peAtual', delta)}
        />

        <StatQuickAdjust
          label="SAN"
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
              type="button"
              onClick={() => setFormTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                active
                  ? 'bg-white text-black'
                  : 'border border-zinc-800 bg-zinc-950 text-zinc-300 hover:border-zinc-600'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className={`space-y-6 flex-1 min-h-0 pb-10 ${scrollClass}`}>
        {formTab === 'gerais' && (
          <GeneralTab
            data={data}
            handleChange={handleChange}
            handleSkillChange={handleSkillChange}
            addSkill={addSkill}
            removeSkill={removeSkill}
            rollFromSheet={rollFromSheet}
          />
        )}

        {formTab === 'ataques' && (
          <AttacksTab
            data={data}
            handleAttackChange={handleAttackChange}
            addAttack={addAttack}
            removeAttack={removeAttack}
            rollFromSheet={rollFromSheet}
          />
        )}

        {formTab === 'rolagens' && (
          <RollsTab rolls={activeSheetRolls} />
        )}

        {formTab === 'habilidades' && (
          <ComplexTab
            title="Habilidades"
            notesLabel="Anotações gerais de habilidades"
            notesValue={data.habilidadesNotas}
            onNotesChange={(event) =>
              handleChange('habilidadesNotas', event.target.value)
            }
            listName="habilidades"
            addLabel="Adicionar habilidade"
            items={data.habilidades}
            expandedEntries={expandedEntries}
            toggleEntry={toggleEntry}
            handleComplexItemChange={handleComplexItemChange}
            addComplexItem={addComplexItem}
            removeListItem={removeListItem}
          />
        )}

        {formTab === 'rituais' && (
          <RitualsTab
            data={data}
            handleChange={handleChange}
            handleComplexItemChange={handleComplexItemChange}
            addComplexItem={addComplexItem}
            removeListItem={removeListItem}
            expandedEntries={expandedEntries}
            toggleEntry={toggleEntry}
            rollFromSheet={rollFromSheet}
          />
        )}

        {formTab === 'informacoes' && (
          <InfoTab
            data={data}
            handleChange={handleChange}
            handleComplexItemChange={handleComplexItemChange}
            addComplexItem={addComplexItem}
            removeListItem={removeListItem}
            expandedEntries={expandedEntries}
            toggleEntry={toggleEntry}
          />
        )}
      </div>
    </aside>
  )
}

function StatQuickAdjust({ label, current, max, onAdjust }) {
  return (
    <div className="rounded-[22px] border border-zinc-800 bg-zinc-950/80 p-4">
      <div className="mb-3 text-xs uppercase tracking-[0.24em] text-zinc-300">
        {label}
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

function GeneralTab({
  data,
  handleChange,
  handleSkillChange,
  addSkill,
  removeSkill,
  rollFromSheet,
}) {
  return (
    <>
      <div>
        <SectionTitle>Identificação</SectionTitle>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field
            label="Nome"
            value={data.nome}
            onChange={(event) => handleChange('nome', event.target.value)}
          />

          <Field
            label="Equipe"
            value={data.equipe}
            onChange={(event) => handleChange('equipe', event.target.value)}
          />

          <Field
            label="Origem"
            value={data.origem}
            onChange={(event) => handleChange('origem', event.target.value)}
          />

          <Field
            label="Classe"
            value={data.classe}
            onChange={(event) => handleChange('classe', event.target.value)}
          />

          <Field
            label="Trilha"
            value={data.trilha}
            onChange={(event) => handleChange('trilha', event.target.value)}
          />

          <Field
            label="NEX"
            value={data.nex}
            onChange={(event) => handleChange('nex', event.target.value)}
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <SectionTitle>Elemento</SectionTitle>

        <label className="space-y-2">
          <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">
            Elemento principal
          </div>

          <select
            className={inputStyle}
            value={data.elementoPrincipal}
            onChange={(event) =>
              handleChange('elementoPrincipal', event.target.value)
            }
          >
            {elementOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <SectionTitle>Recursos e defesa</SectionTitle>

        <div className="grid grid-cols-2 gap-3">
          <Field
            label="PV"
            value={data.pv}
            onChange={(event) => handleChange('pv', event.target.value)}
          />

          <Field
            label="PV atual"
            value={data.pvAtual}
            onChange={(event) => handleChange('pvAtual', event.target.value)}
          />

          <Field
            label="PE"
            value={data.pe}
            onChange={(event) => handleChange('pe', event.target.value)}
          />

          <Field
            label="PE atual"
            value={data.peAtual}
            onChange={(event) => handleChange('peAtual', event.target.value)}
          />

          <Field
            label="Sanidade"
            value={data.sanidade}
            onChange={(event) => handleChange('sanidade', event.target.value)}
          />

          <Field
            label="Sanidade atual"
            value={data.sanidadeAtual}
            onChange={(event) =>
              handleChange('sanidadeAtual', event.target.value)
            }
          />

          <Field
            label="Defesa"
            value={data.defesa}
            onChange={(event) => handleChange('defesa', event.target.value)}
          />

          <Field
            label="Esquiva"
            value={data.esquiva}
            onChange={(event) => handleChange('esquiva', event.target.value)}
          />

          <Field
            label="Bloqueio"
            value={data.bloqueio}
            onChange={(event) => handleChange('bloqueio', event.target.value)}
          />

          <Field
            label="Deslocamento"
            value={data.deslocamento}
            onChange={(event) =>
              handleChange('deslocamento', event.target.value)
            }
          />

          <Field
            label="Fortitude"
            value={data.fortitude}
            onChange={(event) => handleChange('fortitude', event.target.value)}
            placeholder="Ex: 1d20+7"
            rollable
            onRoll={rollFromSheet}
          />

          <Field
            label="Reflexos"
            value={data.reflexos}
            onChange={(event) => handleChange('reflexos', event.target.value)}
            placeholder="Ex: 1d20+5"
            rollable
            onRoll={rollFromSheet}
          />

          <Field
            label="Vontade"
            value={data.vontade}
            onChange={(event) => handleChange('vontade', event.target.value)}
            placeholder="Ex: 1d20+4"
            rollable
            onRoll={rollFromSheet}
          />

          <Field
            label="Iniciativa"
            value={data.iniciativa}
            onChange={(event) => handleChange('iniciativa', event.target.value)}
            placeholder="Ex: 1d20+3"
            rollable
            onRoll={rollFromSheet}
          />

          <Field
            label="Percepção"
            value={data.percepcao}
            onChange={(event) => handleChange('percepcao', event.target.value)}
            placeholder="Ex: 1d20+5"
            rollable
            onRoll={rollFromSheet}
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
              <div className="text-center text-xs uppercase tracking-[0.24em] text-zinc-400">
                {label}
              </div>

              <input
                type="number"
                className={`${inputStyle} text-center`}
                value={data[key]}
                onChange={(event) => handleChange(key, event.target.value)}
              />
            </label>
          ))}
        </div>
      </div>

      <div>
        <SectionTitle>Combate</SectionTitle>

        <SkillsEditor
          skills={Array.isArray(data.pericias) ? data.pericias : []}
          handleSkillChange={handleSkillChange}
          addSkill={addSkill}
          removeSkill={removeSkill}
          rollFromSheet={rollFromSheet}
        />

        <TextBlock
          label="Resistências"
          value={data.resistencias}
          onChange={(event) => handleChange('resistencias', event.target.value)}
          rows={4}
        />

        <TextBlock
          label="Vulnerabilidades"
          value={data.vulnerabilidades}
          onChange={(event) =>
            handleChange('vulnerabilidades', event.target.value)
          }
          rows={4}
        />

        <TextBlock
          label="Imunidades"
          value={data.imunidades}
          onChange={(event) => handleChange('imunidades', event.target.value)}
          rows={4}
        />
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
  )
}

function SkillsEditor({
  skills,
  handleSkillChange,
  addSkill,
  removeSkill,
  rollFromSheet,
}) {
  return (
    <div className="space-y-3">
      <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">
        Perícias
      </div>

      <div className="space-y-2">
        {skills.map((skill, index) => (
          <div
            key={index}
            className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/50 p-2"
          >
            <input
              className={inputStyle}
              value={skill.nome || ''}
              onChange={(event) =>
                handleSkillChange(index, 'nome', event.target.value)
              }
              placeholder="Nome da perícia"
            />

            <Field
              label=""
              value={skill.teste || ''}
              onChange={(event) =>
                handleSkillChange(index, 'teste', event.target.value)
              }
              placeholder="Ex: 1d20+8"
              rollable
              onRoll={(command) =>
                rollFromSheet(command, skill.nome || `Perícia ${index + 1}`)
              }
            />

            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="rounded-xl border border-zinc-800 px-3 text-zinc-400 hover:border-red-800 hover:text-red-300"
              title="Remover perícia"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSkill}
        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
      >
        <Plus className="h-4 w-4" />
        Adicionar perícia
      </button>
    </div>
  )
}

function AttacksTab({
  data,
  handleAttackChange,
  addAttack,
  removeAttack,
  rollFromSheet,
}) {
  return (
    <>
      <SectionTitle>Ataques</SectionTitle>

      <div className="space-y-3">
        {(data.ataques || []).map((ataque, index) => (
          <div
            key={index}
            className="grid grid-cols-1 gap-3 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3 md:grid-cols-2"
          >
            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
              <div className="truncate text-sm font-bold text-zinc-300">
                {ataque.nome || `Ataque ${index + 1}`}
              </div>

              <div className="mt-1 text-xs text-zinc-500">
                Custo em PE: {ataque.custoPe || '—'}
              </div>
            </div>

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
              onChange={(event) =>
                handleAttackChange(index, 'nome', event.target.value)
              }
            />

            <Field
              label="Custo em PE"
              value={ataque.custoPe}
              onChange={(event) =>
                handleAttackChange(index, 'custoPe', event.target.value)
              }
              placeholder="Ex: 2"
            />

            <Field
              label="Teste"
              value={ataque.teste}
              onChange={(event) =>
                handleAttackChange(index, 'teste', event.target.value)
              }
              placeholder="Ex: 1d20+8"
              rollable
              onRoll={(command) =>
                rollFromSheet(command, `${ataque.nome || 'Ataque'} - Teste`)
              }
            />

            <Field
              label="Dano"
              value={ataque.dano}
              onChange={(event) =>
                handleAttackChange(index, 'dano', event.target.value)
              }
              placeholder="Ex: 2d8+4"
              rollable
              onRoll={(command) =>
                rollFromSheet(command, `${ataque.nome || 'Ataque'} - Dano`)
              }
            />

            <Field
              label="Dano médio"
              value={ataque.danoMedio}
              onChange={(event) =>
                handleAttackChange(index, 'danoMedio', event.target.value)
              }
              placeholder="Ex: 13"
            />

            <Field
              label="Dano crítico"
              value={ataque.danoCritico}
              onChange={(event) =>
                handleAttackChange(index, 'danoCritico', event.target.value)
              }
              placeholder="Ex: 4d8+8"
              rollable
              onRoll={(command) =>
                rollFromSheet(command, `${ataque.nome || 'Ataque'} - Crítico`)
              }
            />

            <Field
              label="Crítico / Alcance / Especial"
              value={ataque.extra}
              onChange={(event) =>
                handleAttackChange(index, 'extra', event.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addAttack}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
        >
          <Plus className="h-4 w-4" />
          Adicionar ataque
        </button>
      </div>
    </>
  )
}

function RollsTab({ rolls }) {
  return (
    <>
      <SectionTitle>Rolagens da ficha</SectionTitle>

      <div className="space-y-3">
        {rolls.length ? (
          rolls.map((entry) => (
            <div
              key={entry.id}
              className="rounded-[22px] border border-zinc-800 bg-zinc-950/70 p-3"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="truncate text-sm font-black text-white">
                  {entry.input}
                </div>

                <div className="shrink-0 text-xs text-zinc-500">
                  {entry.createdAt}
                </div>
              </div>

              <RollResultLine entry={entry} />
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-500">
            Nenhuma rolagem feita nesta ficha ainda.
          </div>
        )}
      </div>
    </>
  )
}

function RitualsTab({
  data,
  handleChange,
  handleComplexItemChange,
  addComplexItem,
  removeListItem,
  expandedEntries,
  toggleEntry,
  rollFromSheet,
}) {
  return (
    <>
      <SectionTitle>DT de rituais</SectionTitle>

      <Field
        label="DT de rituais"
        value={data.dtRitual}
        onChange={(event) => handleChange('dtRitual', event.target.value)}
        placeholder="Ex: 22"
      />

      <SectionTitle>Rituais</SectionTitle>

      <div className="space-y-4">
        {(data.rituais || []).map((item, index) => {
          const ritual =
            typeof item === 'string'
              ? { nome: item, descricao: '', dano: '' }
              : item

          const key = `rituais-edit-${index}`

          return (
            <CollapsibleEntry
              key={key}
              title={ritual.nome || `Ritual ${index + 1}`}
              subtitle={`Custo em PE: ${ritual.custoPe || '—'}`}
              expanded={!!expandedEntries[key]}
              onToggle={() => toggleEntry(key)}
              onRemove={() => removeListItem('rituais', index)}
              danger
            >
              <div className="space-y-3">
                <Field
                  label="Nome"
                  value={ritual.nome}
                  onChange={(event) =>
                    handleComplexItemChange(
                      'rituais',
                      index,
                      'nome',
                      event.target.value
                    )
                  }
                  placeholder={`Nome do Ritual ${index + 1}`}
                />

                <Field
                  label="Custo em PE"
                  value={ritual.custoPe}
                  onChange={(event) =>
                    handleComplexItemChange(
                      'rituais',
                      index,
                      'custoPe',
                      event.target.value
                    )
                  }
                  placeholder="Ex: 3"
                />

                <Field
                  label="Dano"
                  value={ritual.dano}
                  onChange={(event) =>
                    handleComplexItemChange(
                      'rituais',
                      index,
                      'dano',
                      event.target.value
                    )
                  }
                  placeholder="Ex: 3d8+3"
                  rollable
                  onRoll={(command) =>
                    rollFromSheet(
                      command,
                      `${ritual.nome || 'Ritual'} - Dano`
                    )
                  }
                />

                <TextBlock
                  label="Descrição"
                  value={ritual.descricao}
                  onChange={(event) =>
                    handleComplexItemChange(
                      'rituais',
                      index,
                      'descricao',
                      event.target.value
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
          type="button"
          onClick={() => addComplexItem('rituais')}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
        >
          <Plus className="h-4 w-4" />
          Adicionar ritual
        </button>
      </div>

      <div className="mt-8">
        <TextBlock
          label="Anotações gerais de rituais"
          value={data.rituaisNotas}
          onChange={(event) => handleChange('rituaisNotas', event.target.value)}
          rows={6}
        />
      </div>
    </>
  )
}

function ComplexTab({
  title,
  notesLabel,
  notesValue,
  onNotesChange,
  listName,
  addLabel,
  items,
  expandedEntries,
  toggleEntry,
  handleComplexItemChange,
  addComplexItem,
  removeListItem,
}) {
  return (
    <>
      <SectionTitle>{title}</SectionTitle>

      <div className="space-y-4">
        {(items || []).map((item, index) => {
          const current =
            typeof item === 'string' ? { nome: item, descricao: '' } : item

          const key = `${listName}-edit-${index}`

          return (
            <CollapsibleEntry
              key={key}
              title={current.nome || `${title} ${index + 1}`}
              expanded={!!expandedEntries[key]}
              onToggle={() => toggleEntry(key)}
              onRemove={() => removeListItem(listName, index)}
              danger
            >
              <div className="space-y-3">
                <input
                  className={inputStyle}
                  value={current.nome}
                  onChange={(event) =>
                    handleComplexItemChange(
                      listName,
                      index,
                      'nome',
                      event.target.value
                    )
                  }
                  placeholder={`Nome ${index + 1}`}
                />

                {listName === 'habilidades' && (
                  <input
                    className={inputStyle}
                    value={current.custoPe || ''}
                    onChange={(event) =>
                      handleComplexItemChange(
                        listName,
                        index,
                        'custoPe',
                        event.target.value
                      )
                    }
                    placeholder="Custo em PE"
                  />
                )}

                <textarea
                  className={`${inputStyle} min-h-[96px] resize-y`}
                  value={current.descricao}
                  onChange={(event) =>
                    handleComplexItemChange(
                      listName,
                      index,
                      'descricao',
                      event.target.value
                    )
                  }
                  placeholder="Descrição..."
                  rows={4}
                />
              </div>
            </CollapsibleEntry>
          )
        })}

        <button
          type="button"
          onClick={() => addComplexItem(listName)}
          className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
        >
          <Plus className="h-4 w-4" />
          {addLabel}
        </button>
      </div>

      <div className="mt-8">
        <TextBlock
          label={notesLabel}
          value={notesValue}
          onChange={onNotesChange}
          rows={6}
        />
      </div>
    </>
  )
}

function InfoTab({
  data,
  handleChange,
  handleComplexItemChange,
  addComplexItem,
  removeListItem,
  expandedEntries,
  toggleEntry,
}) {
  return (
    <>
      <SectionTitle>Itens</SectionTitle>

      <ComplexList
        items={data.itens}
        listName="itens"
        title="Item"
        addLabel="Adicionar item"
        expandedEntries={expandedEntries}
        toggleEntry={toggleEntry}
        handleComplexItemChange={handleComplexItemChange}
        addComplexItem={addComplexItem}
        removeListItem={removeListItem}
      />

      <div className="mt-8 space-y-6">
        <TextBlock
          label="Anotações gerais de itens"
          value={data.itensNotas}
          onChange={(event) => handleChange('itensNotas', event.target.value)}
          rows={4}
        />

        <TextBlock
          label="Aparência"
          value={data.aparencia}
          onChange={(event) => handleChange('aparencia', event.target.value)}
          rows={6}
        />

        <TextBlock
          label="História"
          value={data.historia}
          onChange={(event) => handleChange('historia', event.target.value)}
          rows={10}
        />

        <TextBlock
          label="Anotações gerais"
          value={data.anotacoesGerais}
          onChange={(event) =>
            handleChange('anotacoesGerais', event.target.value)
          }
          rows={8}
        />

        <TextBlock
          label="Informações extras"
          value={data.informacoesGerais}
          onChange={(event) =>
            handleChange('informacoesGerais', event.target.value)
          }
          rows={8}
        />
      </div>
    </>
  )
}

function ComplexList({
  items,
  listName,
  title,
  addLabel,
  expandedEntries,
  toggleEntry,
  handleComplexItemChange,
  addComplexItem,
  removeListItem,
}) {
  return (
    <div className="space-y-4">
      {(items || []).map((item, index) => {
        const current =
          typeof item === 'string' ? { nome: item, descricao: '' } : item

        const key = `${listName}-edit-${index}`

        return (
          <CollapsibleEntry
            key={key}
            title={current.nome || `${title} ${index + 1}`}
            subtitle={
              listName === 'habilidades'
                ? `Custo em PE: ${current.custoPe || '—'}`
                : ''
            }
            expanded={!!expandedEntries[key]}
            onToggle={() => toggleEntry(key)}
            onRemove={() => removeListItem(listName, index)}
            danger
          >
            <div className="space-y-3">
              <input
                className={inputStyle}
                value={current.nome}
                onChange={(event) =>
                  handleComplexItemChange(
                    listName,
                    index,
                    'nome',
                    event.target.value
                  )
                }
                placeholder={`Nome do ${title.toLowerCase()} ${index + 1}`}
              />

              <textarea
                className={`${inputStyle} min-h-[96px] resize-y`}
                value={current.descricao}
                onChange={(event) =>
                  handleComplexItemChange(
                    listName,
                    index,
                    'descricao',
                    event.target.value
                  )
                }
                placeholder="Descrição..."
                rows={4}
              />
            </div>
          </CollapsibleEntry>
        )
      })}

      <button
        type="button"
        onClick={() => addComplexItem(listName)}
        className="inline-flex items-center gap-2 rounded-2xl border border-zinc-700 px-3 py-2 text-sm font-semibold hover:border-zinc-500"
      >
        <Plus className="h-4 w-4" />
        {addLabel}
      </button>
    </div>
  )
}

function CollapsibleEntry({
  title,
  subtitle = '',
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
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-zinc-100">
              {title}
            </span>

            {subtitle && (
              <span className="mt-1 block truncate text-xs text-zinc-500">
                {subtitle}
              </span>
            )}
          </span>

          <span className="text-xs font-bold uppercase tracking-[0.18em] text-violet-400">
            {expanded ? 'Fechar' : 'Abrir'}
          </span>
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