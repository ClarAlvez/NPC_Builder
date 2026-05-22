import RollButton from './RollButton'

export const labelStyle = 'text-xs uppercase tracking-[0.24em] text-zinc-400'

export const inputStyle =
  'w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-zinc-500'

export const textareaStyle = `${inputStyle} min-h-[96px] resize-y`

export function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  rollable = false,
  onRoll,
}) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>

      <div className="flex gap-2">
        <input
          type={type}
          className={inputStyle}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
        />

        {rollable && (
          <RollButton command={value} label={label} onRoll={onRoll} />
        )}
      </div>
    </label>
  )
}

export function TextBlock({
  label,
  value,
  onChange,
  placeholder = '',
  rows = 5,
  rollable = false,
  onRoll,
}) {
  return (
    <label className="space-y-2">
      <div className={labelStyle}>{label}</div>

      <div className="flex gap-2">
        <textarea
          className={textareaStyle}
          rows={rows}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
        />

        {rollable && (
          <div className="pt-1">
            <RollButton command={value} label={label} onRoll={onRoll} />
          </div>
        )}
      </div>
    </label>
  )
}