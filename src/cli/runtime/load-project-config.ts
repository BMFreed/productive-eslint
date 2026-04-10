import { createJiti } from 'jiti'
import { access } from 'node:fs/promises'
import path from 'node:path'

import { isMarkedProductiveComposer } from '../../utils/marker'
import { CliError } from './errors'

const ESLINT_CONFIG_NAMES = ['eslint.config.ts', 'eslint.config.mts']

export interface ILoadedProjectConfig {
  composer: ReturnType<typeof ensureProductiveComposer>
  configPath: string
}

const findConfigPath = async (cwd: string): Promise<string | null> => {
  for (const candidate of ESLINT_CONFIG_NAMES) {
    const filePath = path.join(cwd, candidate)

    try {
      await access(filePath)
      return filePath
    } catch {
      continue
    }
  }

  return null
}

const ensureProductiveComposer = (value: unknown) => {
  if (!isMarkedProductiveComposer(value)) {
    throw new CliError(
      'The selected project does not export a supported productive-eslint composer pipeline.',
    )
  }

  return value
}

const unwrapDefaultExport = (value: unknown): unknown => {
  if (!value || typeof value !== 'object' || !('default' in value)) {
    return value
  }

  const moduleValue = value as { default?: unknown }

  return moduleValue.default ?? value
}

export const loadProjectConfig = async (
  cwd: string,
): Promise<ILoadedProjectConfig> => {
  const configPath = await findConfigPath(cwd)

  if (!configPath) {
    throw new CliError(
      `No supported eslint.config.ts or eslint.config.mts file was found in "${cwd}".`,
    )
  }

  const jiti = createJiti(import.meta.url, {
    fsCache: false,
    moduleCache: false,
  })
  const loadedModule: unknown = jiti(configPath)
  const loadedConfig = unwrapDefaultExport(loadedModule)

  return {
    composer: ensureProductiveComposer(loadedConfig),
    configPath,
  }
}
