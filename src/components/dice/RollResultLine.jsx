import React from 'react'

function RollValue({ roll }) {
  const valueText =
    roll.values.length > 1 ? `[${roll.values.join('!')}]` : String(roll.total)

  const isSpecial = roll.isMax || roll.isMin || roll.crit

  return (
    <span
      className={`inline-block ${
        roll.kept ? 'text-zinc-200' : 'text-zinc-600 line-through'
      } ${isSpecial ? 'font-black text-white' : 'font-medium'}`}
    >
      {valueText}
    </span>
  )
}

export default function RollResultLine({ entry }) {
  const sortedResults = [...entry.results]
    .map((result, originalIndex) => ({
      ...result,
      originalIndex,
    }))
    .sort((a, b) => b.total - a.total)

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm">
      <span className="shrink-0 font-bold text-violet-300">
        {entry.input}:
      </span>

      {sortedResults.map((result, resultIndex) => (
        <React.Fragment key={`${entry.id}-${result.originalIndex}`}>
          {entry.repeat > 1 && (
            <span className="shrink-0 text-xs font-black uppercase tracking-[0.14em] text-zinc-500">
              #{result.originalIndex + 1}
            </span>
          )}

          {result.diceGroups?.length ? (
            result.diceGroups.map((group, groupIndex) => {
              const sortedRolls = [...group.rolls].sort(
                (a, b) => b.total - a.total
              )

              return (
                <React.Fragment
                  key={`${entry.id}-${result.originalIndex}-${group.token}-${groupIndex}`}
                >
                  {sortedRolls.map((roll, rollIndex) => (
                    <React.Fragment
                      key={`${entry.id}-${result.originalIndex}-${group.token}-${groupIndex}-${rollIndex}`}
                    >
                      <RollValue roll={roll} />

                      {rollIndex < sortedRolls.length - 1 && (
                        <span className="text-zinc-600">+</span>
                      )}
                    </React.Fragment>
                  ))}

                  {groupIndex < result.diceGroups.length - 1 && (
                    <span className="mx-1 text-zinc-600">|</span>
                  )}
                </React.Fragment>
              )
            })
          ) : (
            <span className="text-zinc-500">{result.mathExpression}</span>
          )}

          <span className="mx-1 text-zinc-600">=</span>

          <span className="shrink-0 text-xl font-black text-white">
            {result.total}
          </span>

          {result.comparison && (
            <span
              className={`shrink-0 text-sm font-bold ${
                result.comparison === 'Sucesso'
                  ? 'text-emerald-300'
                  : 'text-red-300'
              }`}
            >
              {result.comparison}
            </span>
          )}

          {resultIndex < sortedResults.length - 1 && (
            <span className="mx-2 text-zinc-700">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}