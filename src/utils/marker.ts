import type { FlatConfigComposer } from 'eslint-flat-config-utils'

import type { IResolvedCapabilities } from '../config/types'

const PRODUCTIVE_ESLINT_MARKER_KEY = 'productive-eslint.config'
const PRODUCTIVE_ESLINT_CAPABILITIES_KEY = 'productive-eslint.capabilities'

export const PRODUCTIVE_ESLINT_MARKER = Symbol.for(PRODUCTIVE_ESLINT_MARKER_KEY)
export const PRODUCTIVE_ESLINT_CAPABILITIES = Symbol.for(
  PRODUCTIVE_ESLINT_CAPABILITIES_KEY,
)

export interface IMarkedComposer {
  [PRODUCTIVE_ESLINT_CAPABILITIES]?: IResolvedCapabilities
  [PRODUCTIVE_ESLINT_MARKER]?: true
}

export const markProductiveComposer = <T extends object>(
  composer: FlatConfigComposer<T>,
  capabilities: IResolvedCapabilities,
): FlatConfigComposer<T> => {
  void Object.defineProperty(composer, PRODUCTIVE_ESLINT_MARKER, {
    configurable: false,
    enumerable: false,
    value: true,
    writable: false,
  })
  void Object.defineProperty(composer, PRODUCTIVE_ESLINT_CAPABILITIES, {
    configurable: false,
    enumerable: false,
    value: capabilities,
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
    !!composer[PRODUCTIVE_ESLINT_CAPABILITIES] &&
    typeof composer.append === 'function' &&
    typeof composer.override === 'function' &&
    typeof composer.toConfigs === 'function'
  )
}

export const getProductiveCapabilities = (
  value: unknown,
): IResolvedCapabilities | null => {
  if (!isMarkedProductiveComposer(value)) {
    return null
  }

  return value[PRODUCTIVE_ESLINT_CAPABILITIES] ?? null
}
