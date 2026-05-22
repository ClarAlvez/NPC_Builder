import { useState } from 'react'
import { Calculator, Dices, History } from 'lucide-react'
import { inputStyle } from '../../components/common/Field'
import RollResultLine from '../../components/dice/RollResultLine'
import { parseRollemLikeInput } from '../../utils/dice'

const scrollClass =
  'overflow-y-auto overflow-x-hidden pr-2 min-h-0 [scrollbar-width:thin] [scrollbar-color:#52525b_transparent]'

export default function DiceRollerPanel({ diceHistory, setDiceHistory }) {
  const [diceInput, setDiceInput] = useState('1d20')
  const [error, setError] = useState('')

  const roll = () => {
    try {
      setError('')

      const result = parseRollemLikeInput(diceInput)

      setDiceHistory((prev) => [result, ...prev].slice(0, 30))
    } catch (err) {
      setError(err.message || 'Erro ao rolar dados.')
    }
  }

  const examples = [
    '1d20+5 ataque',
    '2d20kh1 vantagem',
    '4d6d1 atributo',
    '6#4d6d1',
    '10d6 >> 4',
    '1d6!',
    '4dF',
  ]

  return (
    <main className="min-w-0 h-full min-h-0 xl:col-span-2 overflow-hidden">
      <div className="h-full min-h-0 rounded-[28px] border border-zinc-800 bg-zinc-900/50 p-6 shadow-2xl flex flex-col overflow-hidden">
        <div className="mb-5 shrink-0">
          <div className="mb-2 flex items-center gap-2 text-zinc-300">
            <Dices className="h-4 w-4" />

            <span className="text-xs uppercase tracking-[0.32em]">
              Rolagem de dados
            </span>
          </div>

          <h2 className="text-2xl font-black text-white">
            Dados estilo Rollem
          </h2>

          <p className="mt-2 text-sm text-zinc-400">
            Digite rolagens como faria no Discord: d20, 2d8+3, 4d6d1,
            6#4d6d1, 10d6 &gt;&gt; 4.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] min-h-0 flex-1">
          <section className="min-h-0 flex flex-col rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-5">
            <label className="space-y-2 shrink-0">
              <div className="text-xs uppercase tracking-[0.24em] text-zinc-400">
                Comando de rolagem
              </div>

              <div className="flex gap-2">
                <input
                  className={inputStyle}
                  placeholder="Ex: 1d20+5 ataque"
                  value={diceInput}
                  onChange={(event) => setDiceInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') roll()
                  }}
                />

                <button
                  type="button"
                  onClick={roll}
                  className="rounded-2xl bg-white px-5 py-2 text-sm font-black text-black hover:opacity-90"
                >
                  Rolar
                </button>
              </div>
            </label>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2 shrink-0">
              {examples.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => setDiceInput(example)}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-600"
                >
                  {example}
                </button>
              ))}
            </div>

            <div className={`mt-5 flex-1 min-h-0 space-y-3 ${scrollClass}`}>
              {diceHistory.length ? (
                diceHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-[22px] border border-zinc-800 bg-zinc-900/70 p-3"
                  >
                    <div className="mb-2 flex items-start justify-between gap-3">
                      <div className="text-sm font-black text-white">
                        {entry.input}
                      </div>

                      <div className="text-xs text-zinc-500">
                        {entry.createdAt}
                      </div>
                    </div>

                    <RollResultLine entry={entry} />
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-8 text-center text-sm text-zinc-500">
                  Nenhuma rolagem feita ainda.
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[24px] border border-zinc-800 bg-zinc-950/70 p-5">
            <div className="mb-3 flex items-center gap-2 text-zinc-300">
              <Calculator className="h-4 w-4" />

              <span className="text-xs uppercase tracking-[0.24em]">
                Atalhos úteis
              </span>
            </div>

            <div className="space-y-3 text-sm text-zinc-400">
              <p><strong className="text-zinc-100">d20</strong> rola um dado.</p>
              <p><strong className="text-zinc-100">2d20kh1</strong> vantagem.</p>
              <p><strong className="text-zinc-100">2d20kl1</strong> desvantagem.</p>
              <p><strong className="text-zinc-100">4d6d1</strong> atributo.</p>
              <p><strong className="text-zinc-100">6#4d6d1</strong> gera 6 atributos.</p>
              <p><strong className="text-zinc-100">10d6 &gt;&gt; 4</strong> conta sucessos.</p>
            </div>

            <button
              type="button"
              onClick={() => setDiceHistory([])}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm font-semibold hover:border-zinc-500"
            >
              <History className="h-4 w-4" />
              Limpar histórico
            </button>
          </aside>
        </div>
      </div>
    </main>
  )
}