const runHandler = (handler: () => void): void => {
  handler()
}

export const mount = (): void => {
  runHandler(async () => {
    await Promise.resolve()
  })
}
