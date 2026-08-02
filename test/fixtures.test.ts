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
    try {
      rmSync(FIXTURES_ROOT, { recursive: true, force: true });
    } catch {
      // ignore
    }
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

    // 8. docker-app
    const dockerDir = join(FIXTURES_ROOT, 'docker-app');
    ensureDir(dockerDir);
    writeFileSync(
      join(dockerDir, 'package.json'),
      JSON.stringify({ name: 'docker-app', dependencies: {} }, null, 2),
    );
    writeFileSync(join(dockerDir, 'Dockerfile'), 'FROM node:20');
    writeFileSync(join(dockerDir, 'docker-compose.yml'), 'version: "3.8"\nservices: {}');

    // 9. monorepo-pnpm
    const pnpmDir = join(FIXTURES_ROOT, 'monorepo-pnpm');
    ensureDir(pnpmDir);
    writeFileSync(
      join(pnpmDir, 'package.json'),
      JSON.stringify({ name: 'monorepo-pnpm', dependencies: {} }, null, 2),
    );
    writeFileSync(join(pnpmDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"');
    writeFileSync(join(pnpmDir, 'pnpm-lock.yaml'), '# mock lockfile');

    // 10. deployment-platforms
    const deployDir = join(FIXTURES_ROOT, 'deploy-app');
    ensureDir(deployDir);
    writeFileSync(
      join(deployDir, 'package.json'),
      JSON.stringify({ name: 'deploy-app', dependencies: {} }, null, 2),
    );
    writeFileSync(join(deployDir, 'railway.json'), '{}');
    writeFileSync(join(deployDir, 'render.yaml'), 'services: []');
    writeFileSync(join(deployDir, 'wrangler.toml'), 'name = "worker"');
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

  it('should validate and confirm modern infrastructure detections on docker-app', async () => {
    const root = join(FIXTURES_ROOT, 'docker-app');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    // Legacy analyzer matches nothing since it has no package dependencies
    expect(legacyAnalysis.capabilities).toEqual({});

    // Modern engine detects Docker and Docker Compose
    expect(newAnalysis.capabilities.container).toBeDefined();
    const containerCaps = newAnalysis.capabilities.container!;
    expect(containerCaps.some((c) => c.label === 'Docker')).toBe(true);
    expect(containerCaps.some((c) => c.label === 'Docker Compose')).toBe(true);
  });

  it('should validate and confirm modern infrastructure detections on monorepo-pnpm', async () => {
    const root = join(FIXTURES_ROOT, 'monorepo-pnpm');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    // Legacy analyzer matches nothing
    expect(legacyAnalysis.capabilities).toEqual({});

    // Modern engine detects pnpm package manager
    expect(newAnalysis.capabilities.build).toBeDefined();
    const buildCaps = newAnalysis.capabilities.build!;
    expect(buildCaps.some((c) => c.label === 'pnpm')).toBe(true);
  });

  it('should validate and confirm modern deployments on deploy-app', async () => {
    const root = join(FIXTURES_ROOT, 'deploy-app');
    const scanResult = await scan(root);

    const legacyAnalysis = analyze(scanResult);
    const newAnalysis = await runNewEngine(scanResult);

    // Legacy analyzer matches nothing
    expect(legacyAnalysis.capabilities).toEqual({});

    // Modern engine detects Railway, Render, and Cloudflare Workers
    expect(newAnalysis.capabilities.cloud).toBeDefined();
    const cloudCaps = newAnalysis.capabilities.cloud!;
    expect(cloudCaps.some((c) => c.label === 'Railway')).toBe(true);
    expect(cloudCaps.some((c) => c.label === 'Render')).toBe(true);
    expect(cloudCaps.some((c) => c.label === 'Cloudflare Workers')).toBe(true);
  });
});
