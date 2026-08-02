import { createDefaultFactory } from '../engine/registry/loader.js';
import { PluginLoader } from '../plugins/PluginLoader.js';
import { PluginRegistry } from '../plugins/PluginRegistry.js';

/**
 * Command Handler: plugins
 *
 * Scans, loads, and prints installed plugin metadata and associated detectors.
 *
 * @param cwd Current working directory (repository root)
 * @param version Active version of the Norix CLI
 */
export async function handlePlugins(cwd: string, version: string): Promise<void> {
  const factory = createDefaultFactory();
  const coreDetectors = factory.createAll();

  const registry = new PluginRegistry(coreDetectors);
  const loader = new PluginLoader();
  const loadedPlugins = await loader.loadPlugins(cwd, registry, version);

  process.stdout.write('Core Detectors\n');
  process.stdout.write('--------------\n');
  for (const d of coreDetectors) {
    process.stdout.write(`${d.label}\n`);
  }
  process.stdout.write('\n');

  process.stdout.write('Installed Plugins\n');
  process.stdout.write('-----------------\n');
  if (loadedPlugins.length === 0) {
    process.stdout.write('No plugins loaded.\n\n');
  } else {
    for (const p of loadedPlugins) {
      process.stdout.write(`${p.name}\n`);
      process.stdout.write(`Version: ${p.version}\n`);
      if (p.description) {
        process.stdout.write(`Description: ${p.description}\n`);
      }
      if (p.homepage) {
        process.stdout.write(`Homepage: ${p.homepage}\n`);
      }
      process.stdout.write('\n');
    }
  }

  process.stdout.write('Loaded detectors\n');
  process.stdout.write('----------------\n');
  const registrations = registry.getRegistrations();
  if (registrations.length === 0) {
    process.stdout.write('No plugin detectors loaded.\n');
  } else {
    for (const reg of registrations) {
      const tempInstance = new reg.detectorCtor();
      process.stdout.write(` • ${tempInstance.label} (${reg.pluginName})\n`);
    }
  }
}
