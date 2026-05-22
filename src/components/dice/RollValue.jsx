export default function RollValue({ roll }) {
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