function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function splitReason(input) {
  const match = input.match(/^([0-9dDfFkKhHlLcCnNsS#!+\-*/().<>=\s]+)(.*)$/)

  if (!match) {
    return {
      expression: input.trim(),
      reason: '',
    }
  }

  return {
    expression: match[1].trim(),
    reason: match[2].trim(),
  }
}

export function rollDiceGroup(rawToken) {
  const token = rawToken.trim()

  const diceRegex =
    /^(\d*)d(\d+|f)(!([0-9]+)?)?(ns)?(?:(kh|k|kl|dl|dh|d)(\d+))?(?:c(\d+))?$/i

  const match = token.match(diceRegex)

  if (!match) {
    throw new Error(`Expressão de dado inválida: ${token}`)
  }

  const amount = Number(match[1] || 1)
  const sidesRaw = match[2].toLowerCase()
  const isFate = sidesRaw === 'f'
  const sides = isFate ? 3 : Number(sidesRaw)
  const exploding = Boolean(match[3])
  const explodeTarget = match[4] ? Number(match[4]) : sides
  const noSort = Boolean(match[5])
  const keepDropMode = match[6]
  const keepDropAmount = Number(match[7] || 0)
  const critTarget = match[8] ? Number(match[8]) : null

  if (amount <= 0 || amount > 300) {
    throw new Error('Use entre 1 e 300 dados.')
  }

  if (!isFate && (sides <= 1 || sides > 100000)) {
    throw new Error('Use dados com pelo menos 2 lados e no máximo 100000 lados.')
  }

  const rollOne = () => {
    if (isFate) {
      const fateValues = [-1, 0, 1]
      return fateValues[randomInt(0, 2)]
    }

    return randomInt(1, sides)
  }

  const rolls = []

  for (let i = 0; i < amount; i += 1) {
    let value = rollOne()
    const chain = [value]
    let safety = 0

    while (
      exploding &&
      !isFate &&
      value >= explodeTarget &&
      safety < 100
    ) {
      value = rollOne()
      chain.push(value)
      safety += 1
    }

    const total = chain.reduce((sum, item) => sum + item, 0)

    rolls.push({
      values: chain,
      total,
      kept: true,
      isMax: !isFate && chain.some((item) => item === sides),
      isMin: !isFate && chain.some((item) => item === 1),
      crit: critTarget ? chain.some((item) => item >= critTarget) : false,
    })
  }

  let processed = [...rolls]

  if (!noSort) {
    processed.sort((a, b) => b.total - a.total)
  }

  if (keepDropMode && keepDropAmount > 0) {
    const mode = keepDropMode === 'k' ? 'kh' : keepDropMode
    const amountToApply = Math.min(keepDropAmount, processed.length)

    const sortedAsc = [...processed].sort((a, b) => a.total - b.total)
    const sortedDesc = [...processed].sort((a, b) => b.total - a.total)

    let keptSet = new Set(processed)

    if (mode === 'kh') {
      keptSet = new Set(sortedDesc.slice(0, amountToApply))
    }

    if (mode === 'kl') {
      keptSet = new Set(sortedAsc.slice(0, amountToApply))
    }

    if (mode === 'dl' || mode === 'd') {
      const dropped = new Set(sortedAsc.slice(0, amountToApply))
      keptSet = new Set(processed.filter((roll) => !dropped.has(roll)))
    }

    if (mode === 'dh') {
      const dropped = new Set(sortedDesc.slice(0, amountToApply))
      keptSet = new Set(processed.filter((roll) => !dropped.has(roll)))
    }

    processed = processed.map((roll) => ({
      ...roll,
      kept: keptSet.has(roll),
    }))
  }

  if (!noSort) {
    processed.sort((a, b) => b.total - a.total)
  }

  const total = processed
    .filter((roll) => roll.kept)
    .reduce((sum, roll) => sum + roll.total, 0)

  return {
    total,
    rolls: processed,
    token,
  }
}

function applyPerDieModifier(expression) {
  return expression.replace(
    /(\d*d(?:\d+|f)(?:![0-9]*)?(?:ns)?(?:(?:kh|k|kl|dl|dh|d)\d+)?(?:c\d+)?)(\+\+|--)(\d+)/gi,
    (_, diceToken, operator, value) => {
      const modifier = operator === '++' ? Number(value) : -Number(value)
      const result = rollDiceGroup(diceToken)

      const modifiedTotal = result.rolls
        .filter((roll) => roll.kept)
        .reduce((sum, roll) => sum + roll.total + modifier, 0)

      return String(modifiedTotal)
    }
  )
}

export function evaluateSingleRoll(expression) {
  let working = expression.trim()

  const countMatch = working.match(/^(.+?)\s*(<<|>>)\s*(.+)$/)

  if (countMatch) {
    const left = rollDiceGroup(countMatch[1].trim())
    const target = Number(evaluateSingleRoll(countMatch[3].trim()).total)

    const count = left.rolls.filter((roll) => {
      const value = roll.total
      return countMatch[2] === '>>' ? value >= target : value <= target
    }).length

    return {
      total: count,
      diceGroups: [left],
      mathExpression: `${left.token} ${countMatch[2]} ${target}`,
      comparison: null,
    }
  }

  const comparisonMatch = working.match(/^(.+?)\s*(<=|>=|=|<|>)\s*(.+)$/)

  if (comparisonMatch) {
    const leftResult = evaluateSingleRoll(comparisonMatch[1].trim())
    const rightResult = evaluateSingleRoll(comparisonMatch[3].trim())

    const left = Number(leftResult.total)
    const right = Number(rightResult.total)
    const operator = comparisonMatch[2]

    const passed =
      operator === '<'
        ? left < right
        : operator === '<='
        ? left <= right
        : operator === '>'
        ? left > right
        : operator === '>='
        ? left >= right
        : left === right

    return {
      total: left,
      diceGroups: leftResult.diceGroups,
      mathExpression: `${left} ${operator} ${right}`,
      comparison: passed ? 'Sucesso' : 'Falha',
    }
  }

  const diceGroups = []

  working = applyPerDieModifier(working)

  working = working.replace(
    /(\d*d(?:\d+|f)(?:![0-9]*)?(?:ns)?(?:(?:kh|k|kl|dl|dh|d)\d+)?(?:c\d+)?)/gi,
    (diceToken) => {
      const result = rollDiceGroup(diceToken)
      diceGroups.push(result)
      return String(result.total)
    }
  )

  if (!/^[0-9+\-*/().\s]+$/.test(working)) {
    throw new Error('A expressão contém caracteres inválidos.')
  }

  const total = Function(`"use strict"; return (${working})`)()

  if (!Number.isFinite(total)) {
    throw new Error('Resultado inválido.')
  }

  return {
    total: Math.floor(total),
    diceGroups,
    mathExpression: working,
    comparison: null,
  }
}

export function parseRollemLikeInput(input) {
  const cleanInput = input.trim()

  if (!cleanInput) {
    throw new Error('Digite uma rolagem, por exemplo: 1d20+5')
  }

  const { expression, reason } = splitReason(cleanInput)

  const repeatMatch = expression.match(/^(\d+)#(.+)$/)
  const repeat = repeatMatch ? Number(repeatMatch[1]) : 1
  const rollExpression = repeatMatch ? repeatMatch[2].trim() : expression

  if (repeat <= 0 || repeat > 100) {
    throw new Error('Use entre 1 e 100 repetições.')
  }

  const results = []

  for (let i = 0; i < repeat; i += 1) {
    results.push(evaluateSingleRoll(rollExpression))
  }

  return {
    id: crypto.randomUUID(),
    input: cleanInput,
    expression: rollExpression,
    reason,
    repeat,
    results,
    createdAt: new Date().toLocaleTimeString('pt-BR'),
  }
}