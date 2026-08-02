import { describe, it, expect } from 'vitest';
import { ExpressDetector } from '../src/engine/detectors/ExpressDetector.js';
import { FastifyDetector } from '../src/engine/detectors/FastifyDetector.js';
import { NestJsDetector } from '../src/engine/detectors/NestJsDetector.js';
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
}): EvidenceContext {
  const nodeReader: NodePackageReader = {
    hasPackage: (name) => !!options.packages?.includes(name),
    getPackageVersion: (name) => options.versionMap?.[name] || null,
    getPackageJson: async () => null,
  };

  return {
    repoRoot: '/dummy',
    node: nodeReader,
    workspace: {} as unknown as WorkspaceReader,
    env: {} as unknown as EnvReader,
    configs: {} as unknown as ConfigReader,
    fileSystem: {} as unknown as FileReader,
  };
}

describe('ExpressDetector', () => {
  const detector = new ExpressDetector();

  it('should compile evidence when express dependency is present', async () => {
    const context = createMockContext({
      packages: ['express'],
      versionMap: { express: '4.18.2' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(1.0);
    expect(version).toBe('4.18.2');
  });

  it('should return no evidence when express dependency is absent', async () => {
    const context = createMockContext({
      packages: ['koa', 'lodash'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
    expect(version).toBeUndefined();
  });
});

describe('FastifyDetector', () => {
  const detector = new FastifyDetector();

  it('should compile evidence when fastify dependency is present', async () => {
    const context = createMockContext({
      packages: ['fastify'],
      versionMap: { fastify: '4.21.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(1.0);
    expect(version).toBe('4.21.0');
  });

  it('should return no evidence when fastify dependency is absent', async () => {
    const context = createMockContext({
      packages: ['express'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
    expect(version).toBeUndefined();
  });
});

describe('NestJsDetector', () => {
  const detector = new NestJsDetector();

  it('should compile evidence when @nestjs/core dependency is present', async () => {
    const context = createMockContext({
      packages: ['@nestjs/core'],
      versionMap: { '@nestjs/core': '10.1.3' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[0].weight).toBe(1.0);
    expect(version).toBe('10.1.3');
  });

  it('should compile evidence when both core and common are present', async () => {
    const context = createMockContext({
      packages: ['@nestjs/core', '@nestjs/common'],
      versionMap: { '@nestjs/core': '10.1.3' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('10.1.3');
  });

  it('should return no evidence when @nestjs/core is absent', async () => {
    const context = createMockContext({
      packages: ['express', '@nestjs/common'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
    expect(version).toBeUndefined();
  });
});

describe('Backend Frameworks Integration via Registry', () => {
  it('should execute backend detectors and resolve confidence and version info', async () => {
    const registry = new DetectorRegistry();
    registry.add([new ExpressDetector(), new FastifyDetector(), new NestJsDetector()]);

    const context = createMockContext({
      packages: ['express', '@nestjs/core'],
      versionMap: { express: '4.18.2', '@nestjs/core': '10.1.3' },
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(3);

    const expressResult = results[0];
    expect(expressResult.detectorId).toBe('express');
    expect(expressResult.matched).toBe(true);
    expect(expressResult.version).toBe('4.18.2');
    expect(expressResult.confidence).toBe(1.0);

    const fastifyResult = results[1];
    expect(fastifyResult.detectorId).toBe('fastify');
    expect(fastifyResult.matched).toBe(false);
    expect(fastifyResult.version).toBeUndefined();
    expect(fastifyResult.confidence).toBe(0.0);

    const nestResult = results[2];
    expect(nestResult.detectorId).toBe('nestjs');
    expect(nestResult.matched).toBe(true);
    expect(nestResult.version).toBe('10.1.3');
    expect(nestResult.confidence).toBe(1.0);
  });
});
