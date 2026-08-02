import { describe, it, expect } from 'vitest';
import { ReactDetector } from '../src/engine/detectors/ReactDetector.js';
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
    getPackageVersion: (name) => (name === 'react' ? options.version || null : null),
    getPackageJson: async () =>
      options.packages?.includes('react')
        ? { dependencies: { react: options.version || 'latest' } }
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

describe('ReactDetector Heuristics', () => {
  const detector = new ReactDetector();

  it('should compile evidence for react dependency only', async () => {
    const context = createMockContext({
      packages: ['react'],
      version: '18.3.1',
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(1.0);
    expect(version).toBe('18.3.1');
  });

  it('should compile evidence for react and react-dom dependencies', async () => {
    const context = createMockContext({
      packages: ['react', 'react-dom'],
      version: '18.3.1',
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(version).toBe('18.3.1');
  });

  it('should return no evidence for no react installed', async () => {
    const context = createMockContext({
      packages: ['vue', 'lodash'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
    expect(version).toBeUndefined();
  });
});

describe('ReactDetector Integration via Registry', () => {
  it('should execute ReactDetector and resolve confidence and version info', async () => {
    const registry = new DetectorRegistry();
    registry.add([new ReactDetector()]);

    const context = createMockContext({
      packages: ['react'],
      version: '18.3.1',
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result.detectorId).toBe('react');
    expect(result.capability).toBe('React');
    expect(result.category).toBe(CapabilityCategory.Framework);
    expect(result.matched).toBe(true);
    expect(result.version).toBe('18.3.1');
    expect(result.confidence).toBe(1.0);
  });
});
