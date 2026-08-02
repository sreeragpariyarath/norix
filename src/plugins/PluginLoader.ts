import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { NorixPlugin } from './Plugin.js';
import { PluginRegistry } from './PluginRegistry.js';
import { loadConfig } from '../config/loadConfig.js';

/**
 * Loader class responsible for parsing config, importing plugins, and validating versions.
 */
export class PluginLoader {
  /**
   * Loads and registers all configured plugins.
   *
   * @param repoRoot Absolute path of the repository root
   * @param registry Target registry to register detectors on
   * @param norixVersion Active version of the Norix CLI
   * @returns A promise resolving to the list of loaded plugins
   */
  async loadPlugins(
    repoRoot: string,
    registry: PluginRegistry,
    norixVersion: string,
  ): Promise<NorixPlugin[]> {
    const config = await loadConfig(repoRoot);
    const plugins: NorixPlugin[] = [];
    const seenPluginNames = new Set<string>();

    if (!config.plugins || !Array.isArray(config.plugins)) {
      return [];
    }

    for (const rawPath of config.plugins) {
      if (!rawPath || typeof rawPath !== 'string') {
        throw new Error('Invalid plugin path configured (must be a string).');
      }

      let importPath = rawPath;
      if (rawPath.startsWith('.')) {
        importPath = resolve(repoRoot, rawPath);
        importPath = pathToFileURL(importPath).href;
      }

      try {
        const module = await import(importPath);
        const plugin = (module.default || module.plugin || module) as NorixPlugin;

        if (!plugin || typeof plugin !== 'object') {
          throw new Error('Module did not export a valid plugin object.');
        }
        if (!plugin.name) {
          throw new Error('Plugin is missing the required "name" property.');
        }
        if (!plugin.version) {
          throw new Error('Plugin is missing the required "version" property.');
        }
        if (!plugin.norix) {
          throw new Error('Plugin is missing the required "norix" compatibility property.');
        }
        if (typeof plugin.register !== 'function') {
          throw new Error('Plugin is missing the required "register" method.');
        }

        // Validate version compatibility
        if (!this.satisfies(norixVersion, plugin.norix)) {
          throw new Error(
            `Plugin '${plugin.name}' (v${plugin.version}) is incompatible with Norix v${norixVersion} (requires: '${plugin.norix}').`,
          );
        }

        if (seenPluginNames.has(plugin.name)) {
          throw new Error(`Duplicate plugin name loaded: '${plugin.name}'`);
        }
        seenPluginNames.add(plugin.name);

        await plugin.register(registry);
        plugins.push(plugin);
      } catch (err) {
        throw new Error(
          `Failed to load plugin '${rawPath}': ${err instanceof Error ? err.message : String(err)}`,
          { cause: err },
        );
      }
    }

    return plugins;
  }

  private satisfies(norixVersion: string, range: string): boolean {
    if (!range || range === '*') return true;
    const cleanRange = range.trim();

    if (cleanRange.startsWith('^')) {
      const requiredVersion = cleanRange.slice(1);
      const [reqMajor, reqMinor] = requiredVersion.split('.').map(Number);
      const [curMajor, curMinor] = norixVersion.split('.').map(Number);
      if (reqMajor === undefined || curMajor === undefined) return false;
      return (
        curMajor === reqMajor &&
        (curMinor === undefined || reqMinor === undefined || curMinor >= reqMinor)
      );
    }

    if (cleanRange.startsWith('~')) {
      const requiredVersion = cleanRange.slice(1);
      const [reqMajor, reqMinor, reqPatch] = requiredVersion.split('.').map(Number);
      const [curMajor, curMinor, curPatch] = norixVersion.split('.').map(Number);
      if (reqMajor === undefined || curMajor === undefined) return false;
      return (
        curMajor === reqMajor &&
        curMinor === reqMinor &&
        (curPatch === undefined || reqPatch === undefined || curPatch >= reqPatch)
      );
    }

    return norixVersion === cleanRange;
  }
}
