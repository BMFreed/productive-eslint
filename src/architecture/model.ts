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

export const ARCHITECTURE_ENTRY_PATTERNS = [
  'index.ts',
  'index.tsx',
  'index.mts',
  'index.vue',
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

export const architectureElementTypesRule = [
  'error',
  {
    default: 'disallow',
    rules: [
      {
        allow: ['pages', 'widgets', 'features', 'entities', 'shared'],
        from: 'app',
      },
      {
        allow: ['widgets', 'features', 'entities', 'shared'],
        from: 'pages',
      },
      {
        allow: ['features', 'entities', 'shared'],
        from: 'widgets',
      },
      {
        allow: ['entities', 'shared'],
        from: 'features',
      },
      {
        allow: ['shared'],
        from: 'entities',
      },
      {
        allow: ['shared'],
        from: 'shared',
      },
    ],
  },
] as const satisfies Linter.RuleEntry

export const architectureEntryPointRule = [
  'error',
  {
    default: 'disallow',
    rules: [
      {
        allow: [...ARCHITECTURE_ENTRY_PATTERNS],
        target: ['pages', 'widgets', 'features', 'entities', 'shared'],
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
