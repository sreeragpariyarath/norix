import { describe, it, expect } from 'vitest';
import { TurboRepoDetector } from '../src/engine/detectors/TurboRepoDetector.js';
import { NxDetector } from '../src/engine/detectors/NxDetector.js';
import { EvidenceContext } from '../src/engine/context/EvidenceContext.js';
import { NodePackageReader } from '../src/engine/context/readers/NodePackageReader.js';
import { WorkspaceReader } from '../src/engine/context/readers/WorkspaceReader.js';
import { EnvReader } from '../src/engine/context/readers/EnvReader.js';
import { ConfigReader } from '../src/engine/context/readers/ConfigReader.js';
import { FileReader } from '../src/engine/context/readers/FileReader.js';
import { DetectorRegistry } from '../src/engine/registry/DetectorRegistry.js';

function createMockContext(options: {
  packages?: string[];
  versionMap?: Record<string, string>;
  files?: string[];
}): EvidenceContext {
  const fileSet = new Set(options.files || []);

  const nodeReader: NodePackageReader = {
    hasPackage: (name) => !!options.packages?.includes(name),
    getPackageVersion: (name) => options.versionMap?.[name] || null,
    getPackageJson: async () => null,
  };

  const fileReader: FileReader = {
    hasFile: (path) => fileSet.has(path),
    getFileContent: async (path) => (fileSet.has(path) ? 'mock content' : null),
    getFileContentSync: (path) => (fileSet.has(path) ? 'mock content' : null),
    searchInFile: async () => false,
  };

  const configReader: ConfigReader = {
    getDockerCompose: async () => null,
    searchInConfig: async () => false,
  };

  return {
    repoRoot: '/dummy',
    node: nodeReader,
    workspace: {} as unknown as WorkspaceReader,
    env: {} as unknown as EnvReader,
    configs: configReader,
    fileSystem: fileReader,
  };
}

describe('TurboRepoDetector', () => {
  const detector = new TurboRepoDetector();

  it('should compile evidence and extract version when turbo package is present', async () => {
    const context = createMockContext({
      packages: ['turbo'],
      versionMap: { turbo: '1.10.1' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(version).toBe('1.10.1');
  });

  it('should return no evidence when turbo is absent', async () => {
    const context = createMockContext({});
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
  });
});

describe('NxDetector', () => {
  const detector = new NxDetector();

  it('should compile evidence and extract version when nx package is present', async () => {
    const context = createMockContext({
      packages: ['nx'],
      versionMap: { nx: '16.5.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(version).toBe('16.5.0');
  });
});

describe('Infrastructure Integration via Registry', () => {
  it('should execute build capability detectors and calculate scores', async () => {
    const registry = new DetectorRegistry();
    registry.add([new TurboRepoDetector(), new NxDetector()]);

    const context = createMockContext({
      packages: ['turbo'],
      versionMap: { turbo: '1.10.1' },
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(2);

    const turboResult = results[0];
    expect(turboResult.detectorId).toBe('turborepo');
    expect(turboResult.matched).toBe(true);
    expect(turboResult.version).toBe('1.10.1');
    expect(turboResult.confidence).toBe(1.0);

    const nxResult = results[1];
    expect(nxResult.detectorId).toBe('nx');
    expect(nxResult.matched).toBe(false);
  });
});
