import { helper } from './helper'

const unusedValue = helper

export const run = (enabled: boolean): number | undefined => {
  if (enabled) {
    return 1
    console.log('unreachable')
  }

  return undefined
}
