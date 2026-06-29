import { getPackageInfoSync, isPackageExists } from 'local-pkg'

import type {
  INormalizedOptions,
  IOptions,
  IResolvedCapabilities,
  IResolvedTailwindOptions,
} from './types'

import { Preset } from '../utils/presets'

const autoDetectReact = (): boolean =>
  isPackageExists('react') || isPackageExists('next')

const resolveReactOptions = (
  react: IOptions['react'],
): Pick<INormalizedOptions['react'], 'compiler' | 'enabled'> => {
  if (react === undefined) {
    return {
      compiler: false,
      enabled: autoDetectReact(),
    }
  }

  if (typeof react === 'boolean') {
    return {
      compiler: false,
      enabled: react,
    }
  }

  const enableReact =
    react.enabled ?? (react.compiler ? true : autoDetectReact())
  const enableReactCompiler = react.compiler ?? false

  if (!enableReact && enableReactCompiler) {
    throw new Error(
      'Invalid React configuration: `react.compiler` cannot be true when `react.enabled` is false.',
    )
  }

  return {
    compiler: enableReactCompiler,
    enabled: enableReact,
  }
}

const ensureTailwindSupportInstalled = (): void => {
  if (isPackageExists('tailwindcss', { paths: [process.cwd()] })) {
    return
  }

  throw new Error(
    'Tailwind support requires the `tailwindcss` package to be installed in the target project before enabling `tailwind: { cssConfigPath }`.',
  )
}

const resolveTailwindOptions = (
  tailwind: IOptions['tailwind'],
): IResolvedTailwindOptions => {
  if (!tailwind) {
    return { enabled: false }
  }

  ensureTailwindSupportInstalled()

  return {
    cssConfigPath: tailwind.cssConfigPath,
    enabled: true,
  }
}

const createCapabilities = (
  normalizedOptions: Omit<INormalizedOptions, 'capabilities'>,
): IResolvedCapabilities => ({
  architecture: {
    enabled: normalizedOptions.fsd,
  },
  react: {
    compiler: normalizedOptions.react.compiler,
    enabled: normalizedOptions.react.enabled,
  },
  storybook: {
    enabled: normalizedOptions.storybook.enabled,
  },
  rxjs: {
    enabled: normalizedOptions.rxjs.enabled,
  },
  tailwind: normalizedOptions.tailwind.enabled
    ? {
        cssConfigPath: normalizedOptions.tailwind.cssConfigPath,
        enabled: true,
        vueTemplates: normalizedOptions.vue.enabled,
      }
    : {
        enabled: false,
        vueTemplates: normalizedOptions.vue.enabled,
      },
  vue: {
    enabled: normalizedOptions.vue.enabled,
  },
})

export const resolveNormalizedOptions = (
  options: IOptions = {},
): INormalizedOptions => {
  const fsd = options.fsd ?? true
  const ignores = options.ignores ?? []
  const preset = options.preset ?? Preset.RECOMMENDED
  const react = resolveReactOptions(options.react)
  const storybookEnabled = options.storybook ?? false
  const vueEnabled =
    options.vue ?? (isPackageExists('vue') || isPackageExists('nuxt'))
  const rxjsEnabled = options.rxjs ?? isPackageExists('rxjs')
  const tailwind = resolveTailwindOptions(options.tailwind)
  const normalizedOptionsWithoutCapabilities = {
    fsd,
    ignores,
    preset,
    react: {
      ...react,
      version: getPackageInfoSync('react')?.version ?? '19.0.0',
    },
    rxjs: {
      enabled: rxjsEnabled,
    },
    storybook: {
      enabled: storybookEnabled,
    },
    tailwind,
    vue: {
      enabled: vueEnabled,
    },
  } satisfies Omit<INormalizedOptions, 'capabilities'>

  return {
    ...normalizedOptionsWithoutCapabilities,
    capabilities: createCapabilities(normalizedOptionsWithoutCapabilities),
  }
}
