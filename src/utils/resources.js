export function clampResource(current, max, delta) {
  const currentNumber = Number(current || 0)
  const maxNumber = Number(max || 0)
  const deltaNumber = Number(delta || 0)

  if (!Number.isFinite(deltaNumber)) {
    return String(currentNumber)
  }

  const raw = currentNumber + deltaNumber

  if (!maxNumber) {
    return String(Math.max(0, raw))
  }

  return String(Math.max(0, Math.min(maxNumber, raw)))
}