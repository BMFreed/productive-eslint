import type { FlatConfigComposer } from 'eslint-flat-config-utils'

const PRODUCTIVE_ESLINT_MARKER_KEY = 'productive-eslint.config'

export const PRODUCTIVE_ESLINT_MARKER = Symbol.for(PRODUCTIVE_ESLINT_MARKER_KEY)

export interface IMarkedComposer {
  [PRODUCTIVE_ESLINT_MARKER]?: true
}

export const markProductiveComposer = <T extends object>(
  composer: FlatConfigComposer<T>,
): FlatConfigComposer<T> => {
  void Object.defineProperty(composer, PRODUCTIVE_ESLINT_MARKER, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })

  return composer
}

export const isMarkedProductiveComposer = (
  value: unknown,
): value is FlatConfigComposer<object> & IMarkedComposer => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const composer = value as FlatConfigComposer<object> & IMarkedComposer

  return (
    composer[PRODUCTIVE_ESLINT_MARKER] === true &&
    typeof composer.append === 'function' &&
    typeof composer.override === 'function' &&
    typeof composer.toConfigs === 'function'
  )
}
