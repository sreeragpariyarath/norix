import { tmpdir } from 'node:os';
import { existsSync, mkdirSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scan } from '../src/scanner.js';
import { analyze } from '../src/analyzer.js';
import { EvidenceCache } from '../src/engine/cache/EvidenceCache.js';
import { EvidenceContextImpl } from '../src/engine/context/EvidenceContextImpl.js';
import { createDefaultFactory } from '../src/engine/registry/loader.js';
import { DetectorRegistry } from '../src/engine/registry/DetectorRegistry.js';
import { Profiler } from './profiler.js';
import { generateReport } from './report.js';
import { RepositoryMetrics } from './metrics.js';
import { Detector } from '../src/engine/types/Detector.js';
import { Evidence } from '../src/engine/types/Evidence.js';
import { EvidenceContext } from '../src/engine/context/EvidenceContext.js';

// Setup ES Module globals
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Profiling decorator pattern for detectors to measure individual detector execution times.
class ProfilingDetector implements Detector {
  constructor(
    private inner: Detector,
    private onRecord: (id: string, duration: number) => void,
  ) {}

  get id(): string {
    return this.inner.id;
  }
  get label(): string {
    return this.inner.label;
  }
  get category() {
    return this.inner.category;
  }
  get role(): string {
    return this.inner.role;
  }
  get threshold(): number {
    return this.inner.threshold as number;
  }

  async detect(context: EvidenceContext): Promise<{ evidence: Evidence[]; version?: string }> {
    const start = performance.now();
    try {
      return await this.inner.detect(context);
    } finally {
      const duration = performance.now() - start;
      this.onRecord(this.inner.id, duration);
    }
  }
}

function ensureDir(dirPath: string) {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true });
  }
}

function generateFixtures(targetRoot: string) {
  ensureDir(targetRoot);

  // 1. nextjs-app
  const nextDir = join(targetRoot, 'nextjs-app');
  ensureDir(nextDir);
  writeFileSync(
    join(nextDir, 'package.json'),
    JSON.stringify(
      { name: 'nextjs-app', dependencies: { next: '14.1.0', react: '18.2.0' } },
      null,
      2,
    ),
  );

  // 2. react-vite
  const viteDir = join(targetRoot, 'react-vite');
  ensureDir(viteDir);
  writeFileSync(
    join(viteDir, 'package.json'),
    JSON.stringify(
      { name: 'react-vite', dependencies: { react: '18.2.0', vite: '5.1.0' } },
      null,
      2,
    ),
  );

  // 3. express-api
  const expressDir = join(targetRoot, 'express-api');
  ensureDir(expressDir);
  writeFileSync(
    join(expressDir, 'package.json'),
    JSON.stringify({ name: 'express-api', dependencies: { express: '4.18.2' } }, null, 2),
  );

  // 4. nestjs-api
  const nestDir = join(targetRoot, 'nestjs-api');
  ensureDir(nestDir);
  writeFileSync(
    join(nestDir, 'package.json'),
    JSON.stringify({ name: 'nestjs-api', dependencies: { '@nestjs/core': '10.3.0' } }, null, 2),
  );

  // 5. prisma-postgres
  const prismaDir = join(targetRoot, 'prisma-postgres');
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
  const mongoDir = join(targetRoot, 'mongodb-app');
  ensureDir(mongoDir);
  writeFileSync(
    join(mongoDir, 'package.json'),
    JSON.stringify(
      { name: 'mongodb-app', dependencies: { mongodb: '6.3.0', mongoose: '8.1.0' } },
      null,
      2,
    ),
  );

  // 7. monorepo-turbo
  const turboDir = join(targetRoot, 'monorepo-turbo');
  ensureDir(turboDir);
  writeFileSync(
    join(turboDir, 'package.json'),
    JSON.stringify({ name: 'monorepo-turbo', dependencies: { turbo: '1.10.1' } }, null, 2),
  );

  // 8. docker-app
  const dockerDir = join(targetRoot, 'docker-app');
  ensureDir(dockerDir);
  writeFileSync(
    join(dockerDir, 'package.json'),
    JSON.stringify({ name: 'docker-app', dependencies: {} }, null, 2),
  );
  writeFileSync(join(dockerDir, 'Dockerfile'), 'FROM node:20');
  writeFileSync(join(dockerDir, 'docker-compose.yml'), 'version: "3.8"\nservices: {}');

  // 9. monorepo-pnpm
  const pnpmDir = join(targetRoot, 'monorepo-pnpm');
  ensureDir(pnpmDir);
  writeFileSync(
    join(pnpmDir, 'package.json'),
    JSON.stringify({ name: 'monorepo-pnpm', dependencies: {} }, null, 2),
  );
  writeFileSync(join(pnpmDir, 'pnpm-workspace.yaml'), 'packages:\n  - "packages/*"');
  writeFileSync(join(pnpmDir, 'pnpm-lock.yaml'), '# mock lockfile');

  const wsAppA = join(pnpmDir, 'packages', 'app-a');
  ensureDir(wsAppA);
  writeFileSync(
    join(wsAppA, 'package.json'),
    JSON.stringify({ name: 'app-a', dependencies: { express: '4.18.2' } }, null, 2),
  );

  const wsAppB = join(pnpmDir, 'packages', 'app-b');
  ensureDir(wsAppB);
  writeFileSync(
    join(wsAppB, 'package.json'),
    JSON.stringify({ name: 'app-b', dependencies: { react: '18.2.0' } }, null, 2),
  );

  // 10. deployment-platforms
  const deployDir = join(targetRoot, 'deploy-app');
  ensureDir(deployDir);
  writeFileSync(
    join(deployDir, 'package.json'),
    JSON.stringify({ name: 'deploy-app', dependencies: {} }, null, 2),
  );
  writeFileSync(join(deployDir, 'railway.json'), '{}');
  writeFileSync(join(deployDir, 'render.yaml'), 'services: []');
}

async function run() {
  const tempRoot = join(tmpdir(), 'norix-benchmark');
  console.log(`Generating temporary benchmark fixtures under ${tempRoot}...`);
  try {
    rmSync(tempRoot, { recursive: true, force: true });
  } catch {
    // Ignore
  }
  generateFixtures(tempRoot);

  const repos = readdirSync(tempRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  const metricsList: RepositoryMetrics[] = [];
  const profiler = new Profiler();

  for (const repo of repos) {
    const repoPath = join(tempRoot, repo);
    console.log(`Benchmarking repository: ${repo}...`);

    // ─── Phase 1: Legacy Engine (Scan + Analyze) ───
    profiler.start();
    const legacyScan = await scan(repoPath);
    profiler.lap('analyze');
    analyze(legacyScan);
    profiler.stop();
    const legacyTimeMs = profiler.summary().total;

    // ─── Phase 2: Modern Engine Cold Cache ───
    const cache = new EvidenceCache();
    profiler.start();
    const scanResult = await scan(repoPath);

    profiler.lap('execute');
    // Pre-seed package.json manifest
    const dependencies: Record<string, string> = {};
    for (const [name, info] of scanResult.allPackages.entries()) {
      dependencies[name] = info.version;
    }
    cache.getJson('package.json', () => ({ dependencies }));

    const context = new EvidenceContextImpl(scanResult.repoRoot, new Set<string>(), cache);
    const factory = createDefaultFactory();

    // Setup profiling decorator
    const detectorTimes: Record<string, number> = {};
    const profilingDetectors = factory.createAll().map((d) => {
      return new ProfilingDetector(d, (id, duration) => {
        detectorTimes[id] = (detectorTimes[id] ?? 0) + duration;
      });
    });

    const registry = new DetectorRegistry();
    registry.add(profilingDetectors);

    const newResults = await registry.execute(context);
    profiler.stop();

    const coldEngineTimeMs = profiler.summary().total;
    const cacheStatisticsCold = cache.getStatistics();

    // ─── Phase 3: Modern Engine Warm Cache ───
    profiler.start();
    // Scan again
    const scanResultWarm = await scan(repoPath);

    profiler.lap('execute');
    const contextWarm = new EvidenceContextImpl(scanResultWarm.repoRoot, new Set<string>(), cache);
    // Reuse same registry/detectors or fresh instances (we reuse same cache instance)
    const registryWarm = new DetectorRegistry();
    registryWarm.add(factory.createAll());
    await registryWarm.add(factory.createAll()); // trigger register
    registryWarm.clear();
    registryWarm.add(factory.createAll());

    await registryWarm.execute(contextWarm);
    profiler.stop();
    const warmEngineTimeMs = profiler.summary().total;

    // Collate detector execution durations
    const durations = Object.values(detectorTimes);
    const avgDetectorTimeMs = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
    let slowestDetectorName = 'N/A';
    let slowestDetectorTimeMs = 0;
    for (const [name, time] of Object.entries(detectorTimes)) {
      if (time > slowestDetectorTimeMs) {
        slowestDetectorTimeMs = time;
        slowestDetectorName = name;
      }
    }

    // Collate evidence counts
    const evidenceCount = newResults
      .filter((r) => r.matched)
      .reduce((acc, r) => acc + (r.evidence?.length ?? 0), 0);

    // Estimate file details
    const filesDiscovered =
      cacheStatisticsCold.fileHits + cacheStatisticsCold.fileMisses + scanResult.packageJsonCount;
    // scanner reads packageJsonCount + pnpm-workspace.yaml if it exists
    const hasPnpmWorkspace = existsSync(join(repoPath, 'pnpm-workspace.yaml'));
    const filesRead =
      cacheStatisticsCold.contentMisses + scanResult.packageJsonCount + (hasPnpmWorkspace ? 1 : 0);

    metricsList.push({
      repositoryName: repo,
      filesDiscovered,
      filesRead,
      legacyTimeMs,
      coldEngineTimeMs,
      warmEngineTimeMs,
      cacheStatistics: cacheStatisticsCold,
      memoryUsageMb: process.memoryUsage().heapUsed / 1024 / 1024,
      detectorCount: profilingDetectors.length,
      evidenceCount,
      averageDetectorTimeMs: avgDetectorTimeMs,
      slowestDetectorName,
      slowestDetectorTimeMs,
    });
  }

  // 4. Generate Report
  const projectRoot = resolve(__dirname, '..');
  const reportDir = join(projectRoot, 'benchmark');
  console.log(`Generating Markdown report at ${join(reportDir, 'results.md')}...`);
  const reportMd = generateReport(metricsList, reportDir);

  console.log('\n--- BENCHMARK RESULTS ---');
  console.log(reportMd);
  console.log('-------------------------\n');

  console.log('Cleaning up temporary fixtures...');
  try {
    rmSync(tempRoot, { recursive: true, force: true });
  } catch {
    // Ignore
  }
  console.log('Benchmark run completed successfully!');
}

run().catch((err) => {
  console.error('Benchmark run failed:', err);
  process.exit(1);
});
