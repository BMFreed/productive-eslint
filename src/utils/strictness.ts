import type { Linter } from 'eslint'

/**
 * Strictness presets for ESLint config.
 *
 * - Easy: agent-friendly rules (autofix or trivial manual fixes)
 * - Medium: easy + remaining rules from current config
 * - Hard: easy + medium + extra rules (user-defined)
 */
/** Strictness presets for ESLint config. */
export enum StrictnessPreset {
  EASY = 'easy',
  HARD = 'hard',
  MEDIUM = 'medium',
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
export type TStrictnessPresetMap = Record<StrictnessPreset, TFlatConfigItem>

const PRESET_ORDER: StrictnessPreset[] = [
  StrictnessPreset.EASY,
  StrictnessPreset.MEDIUM,
  StrictnessPreset.HARD,
]

const presetLevel = (preset: StrictnessPreset): number => {
  const idx = PRESET_ORDER.indexOf(preset)
  return idx === -1 ? 0 : idx
}

/**
 * Merges preset configs up to and including the given strictness. Uses
 * structural fields (name, files, plugins, settings, etc.) from the first
 * config, and merges rules from easy, then medium, then hard.
 */
export const mergePresetConfigs = (
  map: TStrictnessPresetMap,
  strictness: StrictnessPreset,
): TFlatConfigItem => {
  const targetLevel = presetLevel(strictness)
  const presetsToMerge = PRESET_ORDER.filter(
    (preset) => presetLevel(preset) <= targetLevel,
  )
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
