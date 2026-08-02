import { join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export interface NorixConfig {
  readonly plugins?: readonly string[];
}

/**
 * Loads the Norix configuration file from the repository root.
 * Supports: norix.config.json, norix.config.js, norix.config.mjs
 *
 * @param repoRoot Absolute path of the repository root
 * @returns A promise resolving to the parsed NorixConfig object
 */
export async function loadConfig(repoRoot: string): Promise<NorixConfig> {
  const jsonPath = join(repoRoot, 'norix.config.json');
  if (existsSync(jsonPath)) {
    try {
      const content = readFileSync(jsonPath, 'utf-8');
      return JSON.parse(content) as NorixConfig;
    } catch (err) {
      throw new Error(
        `Failed to parse norix.config.json: ${err instanceof Error ? err.message : String(err)}`,
        { cause: err },
      );
    }
  }

  const jsFiles = ['norix.config.js', 'norix.config.mjs'];
  for (const file of jsFiles) {
    const fullPath = join(repoRoot, file);
    if (existsSync(fullPath)) {
      try {
        const moduleUrl = pathToFileURL(fullPath).href;
        const module = await import(moduleUrl);
        const config = module.default || module;
        if (!config || typeof config !== 'object') {
          throw new Error('Config file must export an object.');
        }
        return config as NorixConfig;
      } catch (err) {
        throw new Error(
          `Failed to load ${file}: ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    }
  }

  return {};
}
