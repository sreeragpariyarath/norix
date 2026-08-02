import { describe, it, expect } from 'vitest';
import { ConfidenceEngine } from '../src/engine/scoring/ConfidenceEngine.js';
import { DetectorFactory } from '../src/engine/registry/DetectorFactory.js';
import { DetectorRegistry } from '../src/engine/registry/DetectorRegistry.js';
import { CapabilityCategory } from '../src/engine/types/Capability.js';
import { Detector } from '../src/engine/types/Detector.js';
import { Evidence } from '../src/engine/types/Evidence.js';
import { EvidenceContext } from '../src/engine/context/EvidenceContext.js';
import { NodePackageReader } from '../src/engine/context/readers/NodePackageReader.js';
import { WorkspaceReader } from '../src/engine/context/readers/WorkspaceReader.js';
import { EnvReader } from '../src/engine/context/readers/EnvReader.js';
import { ConfigReader } from '../src/engine/context/readers/ConfigReader.js';
import { FileReader } from '../src/engine/context/readers/FileReader.js';

class MockDetector implements Detector {
  readonly id = 'mock-id';
  readonly label = 'Mock Label';
  readonly category = CapabilityCategory.Database;
  readonly role = 'database';

  async detect(): Promise<{ evidence: Evidence[]; version?: string }> {
    return {
      evidence: [
        {
          type: 'dependency',
          source: { type: 'manifest', name: 'package.json' },
          message: 'Mock evidence',
          weight: 0.5,
        },
      ],
    };
  }
}

class AnotherMockDetector implements Detector {
  readonly id = 'another-mock';
  readonly label = 'Another Mock';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'framework';

  async detect(): Promise<{ evidence: Evidence[]; version?: string }> {
    return {
      evidence: [
        {
          type: 'file_presence',
          source: { type: 'file', name: 'Dockerfile' },
          message: 'Mock file presence',
          weight: 0.8,
        },
      ],
    };
  }
}

describe('ConfidenceEngine', () => {
  it('should return 0.0 for empty evidence array', () => {
    expect(ConfidenceEngine.calculate([])).toBe(0.0);
  });

  it('should correctly calculate bounded probability score for single weight', () => {
    const evidence = [
      {
        type: 'dependency' as const,
        source: { type: 'manifest' as const, name: 'package.json' },
        message: 'test',
        weight: 0.5,
      },
    ];
    expect(ConfidenceEngine.calculate(evidence)).toBe(0.5);
  });

  it('should correctly calculate bounded probability score for multiple weights', () => {
    const evidence = [
      {
        type: 'dependency' as const,
        source: { type: 'manifest' as const, name: 'package.json' },
        message: 'test 1',
        weight: 0.5,
      },
      {
        type: 'file_presence' as const,
        source: { type: 'file' as const, name: 'Dockerfile' },
        message: 'test 2',
        weight: 0.5,
      },
    ];
    // 1 - (1 - 0.5) * (1 - 0.5) = 1 - 0.25 = 0.75
    expect(ConfidenceEngine.calculate(evidence)).toBe(0.75);
  });

  it('should round score to two decimal places', () => {
    const evidence = [
      {
        type: 'dependency' as const,
        source: { type: 'manifest' as const, name: 'package.json' },
        message: 'test 1',
        weight: 0.33,
      },
      {
        type: 'file_presence' as const,
        source: { type: 'file' as const, name: 'Dockerfile' },
        message: 'test 2',
        weight: 0.33,
      },
    ];
    // 1 - (0.67 * 0.67) = 1 - 0.4489 = 0.5511 -> rounds to 0.55
    expect(ConfidenceEngine.calculate(evidence)).toBe(0.55);
  });

  it('should clamp weight contributions and cumulative outputs between 0.0 and 1.0', () => {
    const evidence = [
      {
        type: 'dependency' as const,
        source: { type: 'manifest' as const, name: 'package.json' },
        message: 'too high',
        weight: 1.5,
      },
      {
        type: 'file_presence' as const,
        source: { type: 'file' as const, name: 'Dockerfile' },
        message: 'too low',
        weight: -0.5,
      },
    ];
    // high clamps to 1.0, low clamps to 0.0
    // 1 - (0.0 * 1.0) = 1.0
    expect(ConfidenceEngine.calculate(evidence)).toBe(1.0);
  });
});

describe('DetectorFactory', () => {
  it('should register and instantiate a detector constructor successfully', () => {
    const factory = new DetectorFactory();
    factory.register('mock-id', MockDetector);

    expect(factory.has('mock-id')).toBe(true);
    const instance = factory.create('mock-id');
    expect(instance).toBeInstanceOf(MockDetector);
  });

  it('should throw error on duplicate constructor registrations', () => {
    const factory = new DetectorFactory();
    factory.register('mock-id', MockDetector);

    expect(() => factory.register('mock-id', MockDetector)).toThrow(
      "Detector with ID 'mock-id' is already registered.",
    );
  });

  it('should instantiate all registered detector instances', () => {
    const factory = new DetectorFactory();
    factory.register('mock-id', MockDetector);
    factory.register('another-mock', AnotherMockDetector);

    const instances = factory.createAll();
    expect(instances).toHaveLength(2);
    expect(instances[0]).toBeInstanceOf(MockDetector);
    expect(instances[1]).toBeInstanceOf(AnotherMockDetector);
  });

  it('should clear registry mapping list successfully', () => {
    const factory = new DetectorFactory();
    factory.register('mock-id', MockDetector);
    factory.clear();

    expect(factory.has('mock-id')).toBe(false);
  });
});

describe('DetectorRegistry', () => {
  it('should execute added detectors sequentially and compile DetectionResult structures', async () => {
    const registry = new DetectorRegistry();
    const mockDetector = new MockDetector();
    const anotherDetector = new AnotherMockDetector();

    registry.add([mockDetector, anotherDetector]);

    const dummyContext: EvidenceContext = {
      repoRoot: '/dummy',
      node: {} as unknown as NodePackageReader,
      workspace: {} as unknown as WorkspaceReader,
      env: {} as unknown as EnvReader,
      configs: {} as unknown as ConfigReader,
      fileSystem: {} as unknown as FileReader,
    };

    const results = await registry.execute(dummyContext);

    expect(results).toHaveLength(2);
    expect(results[0].detectorId).toBe('mock-id');
    expect(results[0].matched).toBe(true); // 0.5 >= 0.3 -> true
    expect(results[0].confidence).toBe(0.5);

    expect(results[1].detectorId).toBe('another-mock');
    expect(results[1].matched).toBe(true); // 0.8 >= 0.3 -> true
    expect(results[1].confidence).toBe(0.8);
  });

  it('should execute in the exact order the detectors were registered', async () => {
    const registry = new DetectorRegistry();
    const executionOrder: string[] = [];

    const d1: Detector = {
      id: 'd1',
      label: 'D1',
      category: CapabilityCategory.Framework,
      role: 'test',
      detect: async () => {
        executionOrder.push('d1');
        return { evidence: [] };
      },
    };

    const d2: Detector = {
      id: 'd2',
      label: 'D2',
      category: CapabilityCategory.Framework,
      role: 'test',
      detect: async () => {
        executionOrder.push('d2');
        return { evidence: [] };
      },
    };

    registry.add([d1, d2]);

    const dummyContext: EvidenceContext = {
      repoRoot: '/dummy',
      node: {} as unknown as NodePackageReader,
      workspace: {} as unknown as WorkspaceReader,
      env: {} as unknown as EnvReader,
      configs: {} as unknown as ConfigReader,
      fileSystem: {} as unknown as FileReader,
    };

    await registry.execute(dummyContext);

    expect(executionOrder).toEqual(['d1', 'd2']);
  });
});
