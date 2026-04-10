const loadValue = async (): Promise<number> => Promise.resolve(1)

export const awaitLiteral = async (): Promise<void> => {
  await 1
}

export const unneededAsync = async (): Promise<number> => 1

export const returnThroughCatch = async (): Promise<number> => {
  try {
    return loadValue()
  } catch {
    return 0
  }
}

export const invalidPromiseParams = (): Promise<number> => Promise.resolve(1, 2)
