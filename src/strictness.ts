import type { TypedFlatConfigItem } from '@antfu/eslint-config'

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
 * Map of preset name to a flat config item. Each preset holds only that level's
 * rules (no duplication).
 */
export type TStrictnessPresetMap = Record<StrictnessPreset, TypedFlatConfigItem>

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
): TypedFlatConfigItem => {
  const targetLevel = presetLevel(strictness)
  const presetsToMerge = PRESET_ORDER.filter(
    (preset) => presetLevel(preset) <= targetLevel,
  )
  const [first] = presetsToMerge
  const firstConfig = first ? map[first] : null
  const base: TypedFlatConfigItem = firstConfig
    ? (() => {
        const { rules: droppedRules, ...rest } = firstConfig
        void droppedRules
        return rest
      })()
    : {}
  const mergedRules: NonNullable<TypedFlatConfigItem['rules']> = {}
  for (const preset of presetsToMerge) {
    const config = map[preset]
    if (config.rules && Object.keys(config.rules).length > 0) {
      Object.assign(mergedRules, config.rules)
    }
  }
  const hasRules = Object.keys(mergedRules).length > 0
  return hasRules ? { ...base, rules: mergedRules } : base
}
