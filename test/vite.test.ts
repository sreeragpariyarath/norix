import { describe, it, expect } from 'vitest';
import { ViteDetector } from '../src/engine/detectors/ViteDetector.js';
import { EvidenceContext } from '../src/engine/context/EvidenceContext.js';
import { NodePackageReader } from '../src/engine/context/readers/NodePackageReader.js';
import { WorkspaceReader } from '../src/engine/context/readers/WorkspaceReader.js';
import { EnvReader } from '../src/engine/context/readers/EnvReader.js';
import { ConfigReader } from '../src/engine/context/readers/ConfigReader.js';
import { FileReader } from '../src/engine/context/readers/FileReader.js';
import { DetectorRegistry } from '../src/engine/registry/DetectorRegistry.js';
import { CapabilityCategory } from '../src/engine/types/Capability.js';

function createMockContext(options: {
  packages?: string[];
  version?: string;
  files?: string[];
}): EvidenceContext {
  const fileSet = new Set(options.files || []);

  const nodeReader: NodePackageReader = {
    hasPackage: (name) => !!options.packages?.includes(name),
    getPackageVersion: (name) => (name === 'vite' ? options.version || null : null),
    getPackageJson: async () =>
      options.packages?.includes('vite')
        ? { dependencies: { vite: options.version || 'latest' } }
        : null,
  };

  const fileReader: FileReader = {
    hasFile: (path) => fileSet.has(path),
    getFileContent: async (path) => (fileSet.has(path) ? 'mock content' : null),
    getFileContentSync: (path) => (fileSet.has(path) ? 'mock content' : null),
    searchInFile: async () => false,
  };

  return {
    repoRoot: '/dummy',
    node: nodeReader,
    workspace: {} as unknown as WorkspaceReader,
    env: {} as unknown as EnvReader,
    configs: {} as unknown as ConfigReader,
    fileSystem: fileReader,
  };
}

describe('ViteDetector Heuristics', () => {
  const detector = new ViteDetector();

  it('should compile evidence for vite dependency only', async () => {
    const context = createMockContext({
      packages: ['vite'],
      version: '6.0.2',
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(1.0);
    expect(version).toBe('6.0.2');
  });

  it('should return no evidence for no vite installed', async () => {
    const context = createMockContext({
      packages: ['webpack', 'lodash'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
    expect(version).toBeUndefined();
  });
});

describe('ViteDetector Integration via Registry', () => {
  it('should execute ViteDetector and resolve confidence and version info', async () => {
    const registry = new DetectorRegistry();
    registry.add([new ViteDetector()]);

    const context = createMockContext({
      packages: ['vite'],
      version: '6.0.2',
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result.detectorId).toBe('vite');
    expect(result.capability).toBe('Vite');
    expect(result.category).toBe(CapabilityCategory.BuildTool);
    expect(result.matched).toBe(true);
    expect(result.version).toBe('6.0.2');
    expect(result.confidence).toBe(1.0);
  });
});
