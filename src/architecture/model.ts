import type { Linter } from 'eslint'

import boundaries from 'eslint-plugin-boundaries'

import type { TFlatConfigItem } from '../utils/presets'

export type TArchitectureElementType =
  | 'app'
  | 'entities'
  | 'features'
  | 'pages'
  | 'shared'
  | 'widgets'

export interface IArchitectureElementMatch {
  elementName?: string
  normalizedPath: string
  type: TArchitectureElementType
}

export const FSD_ELEMENTS = [
  { pattern: 'app', type: 'app' },
  { capture: ['page'], pattern: 'pages/*', type: 'pages' },
  { capture: ['widget'], pattern: 'widgets/*', type: 'widgets' },
  { capture: ['feature'], pattern: 'features/*', type: 'features' },
  { capture: ['entity'], pattern: 'entities/*', type: 'entities' },
  { capture: ['segment'], pattern: 'shared/*', type: 'shared' },
] as const

const ARCHITECTURE_PUBLIC_ELEMENT_TYPES = [
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
] as const

const ARCHITECTURE_PRIVATE_ENTRY_PATTERNS = [
  '!(index).{ts,tsx,mts,vue}',
  '**/!(index).{ts,tsx,mts,vue}',
  '**/*/index.{ts,tsx,mts,vue}',
] as const

export const architectureSettings = {
  'boundaries/elements': [...FSD_ELEMENTS],
  'boundaries/include': ['src/**/*'],
  'import/resolver': {
    typescript: { alwaysTryTypes: true },
  },
} satisfies NonNullable<TFlatConfigItem['settings']>

export const architectureSetupConfig = {
  name: 'boundaries',
  plugins: { boundaries },
  settings: architectureSettings,
} satisfies Pick<TFlatConfigItem, 'name' | 'plugins' | 'settings'>

export const architectureDependenciesRule = [
  'error',
  {
    default: 'disallow',
    rules: [
      {
        allow: {
          to: { type: ['pages', 'widgets', 'features', 'entities', 'shared'] },
        },
        from: { type: 'app' },
      },
      {
        allow: { to: { type: ['widgets', 'features', 'entities', 'shared'] } },
        from: { type: 'pages' },
      },
      {
        allow: { to: { type: ['features', 'entities', 'shared'] } },
        from: { type: 'widgets' },
      },
      {
        allow: { to: { type: ['entities', 'shared'] } },
        from: { type: 'features' },
      },
      {
        allow: { to: { type: ['shared'] } },
        from: { type: 'entities' },
      },
      {
        allow: { to: { type: ['shared'] } },
        from: { type: 'shared' },
      },
      {
        disallow: {
          to: { internalPath: [...ARCHITECTURE_PRIVATE_ENTRY_PATTERNS] },
        },
        message: 'private-entry',
        to: { type: [...ARCHITECTURE_PUBLIC_ELEMENT_TYPES] },
      },
    ],
  },
] as const satisfies Linter.RuleEntry

const normalizePath = (value: string): string =>
  value.replaceAll('\\', '/').replace(/^[./]+/u, '')

const extractElementMatch = (
  normalizedPath: string,
): IArchitectureElementMatch | null => {
  const match = normalizedPath.match(
    /(?:^|\/)(app|pages|widgets|features|entities|shared)(?:\/([^/]+))?/u,
  )

  if (!match) {
    return null
  }

  const [, type, elementName] = match

  return {
    normalizedPath,
    ...(type === 'app' ? {} : { elementName }),
    type: type as TArchitectureElementType,
  }
}

export const matchArchitectureElement = (
  value: string,
): IArchitectureElementMatch | null => extractElementMatch(normalizePath(value))

export const formatDirectionLabel = (
  from: IArchitectureElementMatch,
  to: IArchitectureElementMatch,
): string => {
  if (
    from.type === to.type &&
    from.elementName &&
    to.elementName &&
    from.elementName !== to.elementName &&
    ['entities', 'features', 'pages', 'widgets'].includes(from.type)
  ) {
    return `${from.type} -> ${to.type}(other ${from.type.slice(0, -1)})`
  }

  return `${from.type} -> ${to.type}`
}
