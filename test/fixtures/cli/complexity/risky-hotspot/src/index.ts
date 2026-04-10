const logValue = (value: string): void => {
  globalThis.console.log(value)
}

export const riskyHotspot = async (items: string[]): Promise<number> => {
  let score = 0
  let label = 'empty'

  for (const item of items) {
    if (item.length > 10 && item.includes(':')) {
      score += item.length
      logValue(item)

      if (item.startsWith('admin')) {
        score += 5
        await Promise.resolve()

        if (item.endsWith('disabled')) {
          label = 'blocked'
        } else {
          label = 'active'
        }
      } else if (item.startsWith('guest')) {
        score -= 1
        logValue(label)
      } else {
        score += 1
      }
    } else if (item.length > 3 || item === 'x') {
      score += 2
      logValue(item)
    } else {
      score -= 1
    }
  }

  if (label === 'blocked') {
    return score * -1
  }

  return score
}
