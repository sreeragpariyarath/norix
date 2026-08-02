import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { PluginRegistry } from '../src/plugins/PluginRegistry.js';
import { PluginLoader } from '../src/plugins/PluginLoader.js';
import { loadConfig } from '../src/config/loadConfig.js';
import { Detector } from '../src/engine/types/Detector.js';
import { CapabilityCategory } from '../src/engine/types/Capability.js';

class DummyDetector implements Detector {
  readonly id = 'dummy-detector';
  readonly label = 'Dummy Detector';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'dummy-role';
  async detect() {
    return { evidence: [] };
  }
}

class DuplicateDummyDetector implements Detector {
  readonly id = 'dummy-detector'; // duplicate ID
  readonly label = 'Duplicate Dummy';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'dummy-role';
  async detect() {
    return { evidence: [] };
  }
}

describe('Detector Plugin System', () => {
  describe('loadConfig', () => {
    it('should read config from JSON file', async () => {
      const tempDir = join(tmpdir(), 'norix-test-config-json');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      writeFileSync(
        join(tempDir, 'norix.config.json'),
        JSON.stringify({ plugins: ['./my-plugin'] }),
      );
      const config = await loadConfig(tempDir);
      expect(config.plugins).toEqual(['./my-plugin']);

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should read config from JS file', async () => {
      const tempDir = join(tmpdir(), 'norix-test-config-js');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      writeFileSync(
        join(tempDir, 'norix.config.js'),
        'export default { plugins: ["./js-plugin"] };',
      );
      const config = await loadConfig(tempDir);
      expect(config.plugins).toEqual(['./js-plugin']);

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw error on invalid JSON config', async () => {
      const tempDir = join(tmpdir(), 'norix-test-config-invalid');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      writeFileSync(join(tempDir, 'norix.config.json'), '{ invalid json');
      await expect(loadConfig(tempDir)).rejects.toThrow();

      rmSync(tempDir, { recursive: true, force: true });
    });
  });

  describe('PluginRegistry', () => {
    it('should register detector constructors successfully', () => {
      const registry = new PluginRegistry([]);
      registry.registerDetector({ name: 'Test Plugin', version: '1.0.0' }, DummyDetector);

      expect(registry.getRegistrations()).toHaveLength(1);
      expect(registry.getDetectorConstructors()[0]).toBe(DummyDetector);
    });

    it('should throw error if registering duplicate detector ID', () => {
      const registry = new PluginRegistry([]);
      registry.registerDetector({ name: 'Plugin 1', version: '1.0.0' }, DummyDetector);

      expect(() => {
        registry.registerDetector({ name: 'Plugin 2', version: '1.0.0' }, DuplicateDummyDetector);
      }).toThrow(/Duplicate detector ID detected: 'dummy-detector'/);
    });

    it('should throw error on missing plugin metadata', () => {
      const registry = new PluginRegistry([]);
      expect(() => {
        registry.registerDetector({ name: '', version: '1.0.0' }, DummyDetector);
      }).toThrow(/plugin name is required/);
    });
  });

  describe('PluginLoader', () => {
    it('should load compatible plugins successfully', async () => {
      const tempDir = join(tmpdir(), 'norix-test-loader');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      // Create a valid plugin file
      writeFileSync(
        join(tempDir, 'my-plugin.js'),
        `
        export default {
          name: 'My Custom Plugin',
          version: '1.0.0',
          norix: '^1.0.0',
          register(registry) {
            // registers dummy detector
          }
        };
        `,
      );

      writeFileSync(
        join(tempDir, 'norix.config.json'),
        JSON.stringify({ plugins: ['./my-plugin.js'] }),
      );

      const registry = new PluginRegistry([]);
      const loader = new PluginLoader();
      const loaded = await loader.loadPlugins(tempDir, registry, '1.2.0');

      expect(loaded).toHaveLength(1);
      expect(loaded[0]!.name).toBe('My Custom Plugin');

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw error on version incompatibility', async () => {
      const tempDir = join(tmpdir(), 'norix-test-incompatible');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      writeFileSync(
        join(tempDir, 'incompat-plugin.js'),
        `
        export default {
          name: 'Old Plugin',
          version: '1.0.0',
          norix: '^2.0.0',
          register(registry) {}
        };
        `,
      );

      writeFileSync(
        join(tempDir, 'norix.config.json'),
        JSON.stringify({ plugins: ['./incompat-plugin.js'] }),
      );

      const registry = new PluginRegistry([]);
      const loader = new PluginLoader();

      await expect(loader.loadPlugins(tempDir, registry, '1.0.0')).rejects.toThrow(
        /is incompatible with Norix v1.0.0/,
      );

      rmSync(tempDir, { recursive: true, force: true });
    });

    it('should throw error on duplicate plugin names', async () => {
      const tempDir = join(tmpdir(), 'norix-test-duplicates');
      rmSync(tempDir, { recursive: true, force: true });
      mkdirSync(tempDir, { recursive: true });

      writeFileSync(
        join(tempDir, 'p1.js'),
        `
        export default {
          name: 'Dup Plugin',
          version: '1.0.0',
          norix: '*',
          register(registry) {}
        };
        `,
      );

      writeFileSync(
        join(tempDir, 'p2.js'),
        `
        export default {
          name: 'Dup Plugin', // Duplicate name
          version: '1.0.0',
          norix: '*',
          register(registry) {}
        };
        `,
      );

      writeFileSync(
        join(tempDir, 'norix.config.json'),
        JSON.stringify({ plugins: ['./p1.js', './p2.js'] }),
      );

      const registry = new PluginRegistry([]);
      const loader = new PluginLoader();

      await expect(loader.loadPlugins(tempDir, registry, '1.0.0')).rejects.toThrow(
        /Duplicate plugin name loaded: 'Dup Plugin'/,
      );

      rmSync(tempDir, { recursive: true, force: true });
    });
  });
});
