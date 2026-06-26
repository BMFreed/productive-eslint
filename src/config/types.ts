import type { Preset } from '../utils/presets'

/** Tailwind options for the main config factory. */
export interface ITailwindOptions {
  /** Path to the Tailwind CSS entry file used by the ESLint plugin. */
  cssConfigPath: string
}

/** React options for the main config factory. */
export interface IReactOptions {
  /** Enable React rules. Auto-detected when omitted unless compiler is true. */
  enabled?: boolean
  /** Enable React Compiler readiness rules. Defaults to false. */
  compiler?: boolean
}

/** Options for the main config factory. */
export interface IOptions {
  /** Enable FSD architecture boundaries setup. Defaults to true. */
  fsd?: boolean
  /** Files to ignore. Defaults to empty array. */
  ignores?: string[]
  /** Preset: autoFixable or recommended. Defaults to recommended. */
  preset?: Preset
  /** Enable React rules or configure optional compiler checks. */
  react?: boolean | IReactOptions
  /** Enable Storybook rules for stories and `.storybook` config files. */
  storybook?: boolean
  /** Enable RxJS rules. Auto-detected from installed packages when not set. */
  rxjs?: boolean
  /** Enable Tailwind rules with explicit CSS config path. */
  tailwind?: ITailwindOptions
  /** Enable Vue rules. Auto-detected from installed packages when not set. */
  vue?: boolean
}

export interface IResolvedReactOptions {
  compiler: boolean
  enabled: boolean
  version: string
}

export interface IResolvedVueOptions {
  enabled: boolean
}

export interface IResolvedRxjsOptions {
  enabled: boolean
}

export interface IResolvedStorybookOptions {
  enabled: boolean
}

export type IResolvedTailwindOptions =
  | {
      cssConfigPath: string
      enabled: true
    }
  | {
      enabled: false
    }

export interface IResolvedCapabilities {
  architecture: {
    enabled: boolean
  }
  react: {
    compiler: boolean
    enabled: boolean
  }
  storybook: {
    enabled: boolean
  }
  rxjs: {
    enabled: boolean
  }
  tailwind:
    | {
        cssConfigPath: string
        enabled: true
        vueTemplates: boolean
      }
    | {
        enabled: false
        vueTemplates: boolean
      }
  vue: {
    enabled: boolean
  }
}

export interface INormalizedOptions {
  capabilities: IResolvedCapabilities
  fsd: boolean
  ignores: string[]
  preset: Preset
  react: IResolvedReactOptions
  rxjs: IResolvedRxjsOptions
  storybook: IResolvedStorybookOptions
  tailwind: IResolvedTailwindOptions
  vue: IResolvedVueOptions
}
