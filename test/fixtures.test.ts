import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { scan } from '../src/scanner.js';
import { analyze } from '../src/analyzer.js';
import { runNewEngine } from '../src/engine/integration.js';

const FIXTURES_ROOT = resolve('./fixtures');

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

describe('Real Repository Fixture Validation', () => {
  beforeAll(() => {
    ensureDir(FIXTURES_ROOT);

    // 1. nextjs-app
    const nextDir = join(FIXTURES_ROOT, 'nextjs-app');
    ensureDir(nextDir);
    writeFileSync(
      join(nextDir, 'package.json'),
      JSON.stringify(
        {
          name: 'nextjs-app',
          dependencies: { next: '14.1.0', react: '18.2.0' },
        },
        null,
        2,
      ),
    );

    // 2. react-vite
    const viteDir = join(FIXTURES_ROOT, 'react-vite');
    ensureDir(viteDir);
    writeFileSync(
      join(viteDir, 'package.json'),
      JSON.stringify(
        {
          name: 'react-vite',
          dependencies: { react: '18.2.0', vite: '5.1.0' },
        },
        null,
        2,
      ),
    );

    // 3. express-api
    const expressDir = join(FIXTURES_ROOT, 'express-api');
    ensureDir(expressDir);
    writeFileSync(
      join(expressDir, 'package.json'),
      JSON.stringify(
        {
          name: 'express-api',
          dependencies: { express: '4.18.2' },
        },
        null,
        2,
      ),
    );

    // 4. nestjs-api
    const nestDir = join(FIXTURES_ROOT, 'nestjs-api');
    ensureDir(nestDir);
    writeFileSync(
      join(nestDir, 'package.json'),
      JSON.stringify(
        {
          name: 'nestjs-api',
          dependencies: { '@nestjs/core': '10.3.0' },
        },
        null,
        2,
      ),
    );

    // 5. prisma-postgres
    const prismaDir = join(FIXTURES_ROOT, 'prisma-postgres');
    ensureDir(prismaDir);
    writeFileSync(
      join(prismaDir, 'package.json'),
      JSON.stringify(
        {
          name: 'prisma-postgres',
          dependencies: { prisma: '5.9.0', '@prisma/client': '5.9.0', pg: '8.11.3' },
        },
        null,
        2,
      ),
    );
    ensureDir(join(prismaDir, 'prisma'));
    writeFileSync(join(prismaDir, 'prisma/schema.prisma'), '// mock prisma schema');

    // 6. mongodb-app
    const mongoDir = join(FIXTURES_ROOT, 'mongodb-app');
    ensureDir(mongoDir);
    writeFileSync(
      join(mongoDir, 'package.json'),
      JSON.stringify(
        {
          name: 'mongodb-app',
          dependencies: { mongodb: '6.3.0', mongoose: '8.1.0' },
        },
        null,
        2,
      ),
    );

    // 7. monorepo-turbo
    const turboDir = join(FIXTURES_ROOT, 'monorepo-turbo');
    ensureDir(turboDir);
    writeFileSync(
      join(turboDir, 'package.json'),
      JSON.stringify(
        {
          name: 'monorepo-turbo',
          dependencies: { turbo: '1.10.1' },
        },
        null,
        2,
      ),
    );
  });

  afterAll(() => {
    // Clean up created fixtures safely
    try {
      rmSync(FIXTURES_ROOT, { recursive: true, force: true });
    } catch {
      // ignore deletion errors
    }
  });

  it('should validate and compare outputs for nextjs-app', async () => {
    const root = join(FIXTURES_ROOT, 'nextjs-app');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.framework).toEqual(legacyAnalysis.capabilities.framework);
  });

  it('should validate and compare outputs for react-vite', async () => {
    const root = join(FIXTURES_ROOT, 'react-vite');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.framework).toEqual(legacyAnalysis.capabilities.framework);
  });

  it('should validate and compare outputs for express-api', async () => {
    const root = join(FIXTURES_ROOT, 'express-api');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.framework).toEqual(legacyAnalysis.capabilities.framework);
  });

  it('should validate and compare outputs for nestjs-api', async () => {
    const root = join(FIXTURES_ROOT, 'nestjs-api');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.framework).toEqual(legacyAnalysis.capabilities.framework);
  });

  it('should validate and compare outputs for prisma-postgres', async () => {
    const root = join(FIXTURES_ROOT, 'prisma-postgres');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.orm).toEqual(legacyAnalysis.capabilities.orm);
    expect(newAnalysis.capabilities.database).toEqual(legacyAnalysis.capabilities.database);
  });

  it('should validate and compare outputs for mongodb-app', async () => {
    const root = join(FIXTURES_ROOT, 'mongodb-app');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.orm).toEqual(legacyAnalysis.capabilities.orm);
    expect(newAnalysis.capabilities.database).toEqual(legacyAnalysis.capabilities.database);
  });

  it('should validate and compare outputs for monorepo-turbo', async () => {
    const root = join(FIXTURES_ROOT, 'monorepo-turbo');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    expect(newAnalysis.capabilities.build).toEqual(legacyAnalysis.capabilities.build);
  });
});
