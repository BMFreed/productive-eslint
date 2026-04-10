import type { Linter } from 'eslint'

/**
 * Presets for ESLint config.
 *
 * - AutoFixable: only rules with ESLint autofix support.
 * - Recommended: autofixable rules plus mechanical non-autofixable rules.
 */
export enum Preset {
  AUTO_FIXABLE = 'autoFixable',
  RECOMMENDED = 'recommended',
}

/**
 * Relaxed flat config item type. Loosens `plugins` and `rules` typing because
 * many ESLint plugins lack proper type definitions, and
 * exactOptionalPropertyTypes causes issues with rule value inference.
 */
export type TFlatConfigItem = Omit<Linter.Config, 'plugins' | 'rules'> & {
  plugins?: Record<string, unknown>
  rules?: Record<string, unknown>
}

/**
 * Map of preset name to a flat config item. Each preset holds only that level's
 * rules (no duplication).
 */
export type TPresetMap = Record<Preset, TFlatConfigItem>

const PRESET_ORDER: Preset[] = [Preset.AUTO_FIXABLE, Preset.RECOMMENDED]

/**
 * Merges preset configs up to and including the given preset. Uses structural
 * fields (name, files, plugins, settings, etc.) from the first config, and
 * merges rules from autoFixable, then recommended.
 */
export const mergePresetConfigs = (
  map: TPresetMap,
  preset: Preset,
): TFlatConfigItem => {
  const targetLevel = PRESET_ORDER.indexOf(preset)
  const presetsToMerge = PRESET_ORDER.slice(0, targetLevel + 1)
  const [first] = presetsToMerge
  const firstConfig = first ? map[first] : null
  const base: TFlatConfigItem = firstConfig
    ? (() => {
        const { rules: droppedRules, ...rest } = firstConfig
        void droppedRules
        return rest
      })()
    : {}
  const mergedRules: NonNullable<TFlatConfigItem['rules']> = {}
  for (const preset of presetsToMerge) {
    const config = map[preset]
    if (config.rules && Object.keys(config.rules).length > 0) {
      Object.assign(mergedRules, config.rules)
    }
  }
  const hasRules = Object.keys(mergedRules).length > 0
  return hasRules ? { ...base, rules: mergedRules } : base
}
