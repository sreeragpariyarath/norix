import { describe, it, expect } from 'vitest';
import { PostgresDetector } from '../src/engine/detectors/PostgresDetector.js';
import { MySqlDetector } from '../src/engine/detectors/MySqlDetector.js';
import { MariaDbDetector } from '../src/engine/detectors/MariaDbDetector.js';
import { SqliteDetector } from '../src/engine/detectors/SqliteDetector.js';
import { MongoDbDetector } from '../src/engine/detectors/MongoDbDetector.js';
import { RedisDetector } from '../src/engine/detectors/RedisDetector.js';
import { PrismaDetector } from '../src/engine/detectors/PrismaDetector.js';
import { DrizzleDetector } from '../src/engine/detectors/DrizzleDetector.js';
import { TypeOrmDetector } from '../src/engine/detectors/TypeOrmDetector.js';
import { SequelizeDetector } from '../src/engine/detectors/SequelizeDetector.js';
import { MongooseDetector } from '../src/engine/detectors/MongooseDetector.js';
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

  return {
    repoRoot: '/dummy',
    node: nodeReader,
    workspace: {} as unknown as WorkspaceReader,
    env: {} as unknown as EnvReader,
    configs: {} as unknown as ConfigReader,
    fileSystem: fileReader,
  };
}

describe('PostgresDetector', () => {
  const detector = new PostgresDetector();

  it('should compile evidence and extract version when pg is present', async () => {
    const context = createMockContext({
      packages: ['pg'],
      versionMap: { pg: '8.11.3' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('8.11.3');
  });

  it('should return no evidence when pg is absent', async () => {
    const context = createMockContext({});
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(0);
  });
});

describe('MySqlDetector', () => {
  const detector = new MySqlDetector();

  it('should compile evidence and extract version when mysql2 is present', async () => {
    const context = createMockContext({
      packages: ['mysql2'],
      versionMap: { mysql2: '3.6.1' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('3.6.1');
  });
});

describe('MariaDbDetector', () => {
  const detector = new MariaDbDetector();

  it('should compile evidence and extract version when mariadb is present', async () => {
    const context = createMockContext({
      packages: ['mariadb'],
      versionMap: { mariadb: '3.2.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('3.2.0');
  });
});

describe('SqliteDetector', () => {
  const detector = new SqliteDetector();

  it('should compile evidence and extract version when better-sqlite3 is present', async () => {
    const context = createMockContext({
      packages: ['better-sqlite3'],
      versionMap: { 'better-sqlite3': '9.0.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('9.0.0');
  });
});

describe('MongoDbDetector', () => {
  const detector = new MongoDbDetector();

  it('should compile evidence and extract version when mongodb is present', async () => {
    const context = createMockContext({
      packages: ['mongodb'],
      versionMap: { mongodb: '6.1.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('6.1.0');
  });
});

describe('RedisDetector', () => {
  const detector = new RedisDetector();

  it('should compile evidence and extract version when ioredis is present', async () => {
    const context = createMockContext({
      packages: ['ioredis'],
      versionMap: { ioredis: '5.3.2' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('5.3.2');
  });
});

describe('PrismaDetector', () => {
  const detector = new PrismaDetector();

  it('should compile evidence for prisma dependency and schema config file', async () => {
    const context = createMockContext({
      packages: ['prisma'],
      versionMap: { prisma: '5.2.0' },
      files: ['prisma/schema.prisma'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[1].type).toBe('file_presence');
    expect(version).toBe('5.2.0');
  });

  it('should compile evidence when only package is present', async () => {
    const context = createMockContext({
      packages: ['@prisma/client'],
      versionMap: { '@prisma/client': '5.2.0' },
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });
});

describe('DrizzleDetector', () => {
  const detector = new DrizzleDetector();

  it('should compile evidence for drizzle package and config file', async () => {
    const context = createMockContext({
      packages: ['drizzle-orm'],
      versionMap: { 'drizzle-orm': '0.28.5' },
      files: ['drizzle.config.ts'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[1].type).toBe('file_presence');
    expect(version).toBe('0.28.5');
  });
});

describe('TypeOrmDetector', () => {
  const detector = new TypeOrmDetector();

  it('should compile evidence for typeorm package and configuration', async () => {
    const context = createMockContext({
      packages: ['typeorm'],
      versionMap: { typeorm: '0.3.17' },
      files: ['ormconfig.json'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[1].type).toBe('file_presence');
    expect(version).toBe('0.3.17');
  });
});

describe('SequelizeDetector', () => {
  const detector = new SequelizeDetector();

  it('should compile evidence for sequelize package and .sequelizerc configuration', async () => {
    const context = createMockContext({
      packages: ['sequelize'],
      versionMap: { sequelize: '6.33.0' },
      files: ['.sequelizerc'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(evidence[0].type).toBe('dependency');
    expect(evidence[1].type).toBe('file_presence');
    expect(version).toBe('6.33.0');
  });
});

describe('MongooseDetector', () => {
  const detector = new MongooseDetector();

  it('should compile evidence when mongoose is present', async () => {
    const context = createMockContext({
      packages: ['mongoose'],
      versionMap: { mongoose: '7.5.0' },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('7.5.0');
  });
});

describe('Database & ORM Integration via Registry', () => {
  it('should execute ORM detectors sequentially and resolve versions and confidence scores', async () => {
    const registry = new DetectorRegistry();
    registry.add([new PrismaDetector(), new DrizzleDetector()]);

    const context = createMockContext({
      packages: ['prisma', 'drizzle-orm'],
      versionMap: { prisma: '5.2.0', 'drizzle-orm': '0.28.5' },
      files: ['prisma/schema.prisma'],
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(2);

    const prismaResult = results[0];
    expect(prismaResult.detectorId).toBe('prisma');
    expect(prismaResult.matched).toBe(true);
    expect(prismaResult.version).toBe('5.2.0');
    // 1 - (1 - 0.8) * (1 - 1.0) = 1 - 0.0 = 1.0
    expect(prismaResult.confidence).toBe(1.0);

    const drizzleResult = results[1];
    expect(drizzleResult.detectorId).toBe('drizzle');
    expect(drizzleResult.matched).toBe(true);
    expect(drizzleResult.version).toBe('0.28.5');
    // 1 - (1 - 0.8) = 0.8
    expect(drizzleResult.confidence).toBe(0.8);
  });
});
