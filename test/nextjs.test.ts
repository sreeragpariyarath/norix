import { describe, it, expect } from 'vitest';
import { NextJsDetector } from '../src/engine/detectors/NextJsDetector.js';
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
    getPackageVersion: (name) => (name === 'next' ? options.version || null : null),
    getPackageJson: async () =>
      options.packages?.includes('next')
        ? { dependencies: { next: options.version || 'latest' } }
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

describe('NextJsDetector Heuristics', () => {
  const detector = new NextJsDetector();

  it('should compile evidence for dependency only', async () => {
    const context = createMockContext({
      packages: ['next'],
      version: '14.2.3',
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(0.8);
    expect(version).toBe('14.2.3');
  });

  it('should compile evidence for config only', async () => {
    const context = createMockContext({
      files: ['next.config.js'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('file_presence');
    expect(evidence[0].source.type).toBe('config');
    expect(evidence[0].weight).toBe(0.9);
  });

  it('should compile evidence for app router directory', async () => {
    const context = createMockContext({
      files: ['app'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('file_presence');
    expect(evidence[0].source.name).toBe('app');
    expect(evidence[0].weight).toBe(0.5);
  });

  it('should compile evidence for pages router directory', async () => {
    const context = createMockContext({
      files: ['src/pages'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('file_presence');
    expect(evidence[0].source.name).toBe('src/pages');
    expect(evidence[0].weight).toBe(0.5);
  });

  it('should compile mixed evidence correctly', async () => {
    const context = createMockContext({
      packages: ['next'],
      version: '14.2.3',
      files: ['next.config.ts', 'app', 'next-env.d.ts'],
    });

    const { evidence } = await detector.detect(context);
    // 1 dependency + 1 config + 1 folder + 1 env dts = 4 items of evidence
    expect(evidence).toHaveLength(4);
  });

  it('should return no evidence for a clean codebase', async () => {
    const context = createMockContext({
      packages: ['react', 'lodash'],
      files: ['tsconfig.json'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
  });
});

describe('NextJsDetector Integration via Registry', () => {
  it('should execute NextJsDetector and resolve confidence and version info', async () => {
    const registry = new DetectorRegistry();
    registry.add([new NextJsDetector()]);

    const context = createMockContext({
      packages: ['next'],
      version: '14.2.3',
      files: ['next.config.js', 'src/app'],
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(1);

    const result = results[0];
    expect(result.detectorId).toBe('nextjs');
    expect(result.capability).toBe('Next.js');
    expect(result.category).toBe(CapabilityCategory.Framework);
    expect(result.matched).toBe(true);
    expect(result.version).toBe('14.2.3');

    // 1 - (1 - 0.8) * (1 - 0.9) * (1 - 0.5) = 1 - (0.2 * 0.1 * 0.5) = 1 - 0.01 = 0.99
    expect(result.confidence).toBe(0.99);
  });
});
