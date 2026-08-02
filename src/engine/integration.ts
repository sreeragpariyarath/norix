import { ScanResult, AnalysisResult, CapabilityMatch, CapabilityCategory } from '../types.js';
import { EvidenceCache } from './cache/EvidenceCache.js';
import { EvidenceContextImpl } from './context/EvidenceContextImpl.js';
import { DetectorRegistry } from './registry/DetectorRegistry.js';
import { createDefaultFactory } from './registry/loader.js';

/**
 * Executes the new capability detection engine and maps the results to the legacy AnalysisResult format.
 *
 * @param scanResult The repository raw ScanResult
 * @returns Fully populated legacy-compatible AnalysisResult
 */
export async function runNewEngine(scanResult: ScanResult): Promise<AnalysisResult> {
  const cache = new EvidenceCache();

  // Pre-seed package.json manifest in cache for in-memory scan results and unit tests
  const dependencies: Record<string, string> = {};
  for (const [name, info] of scanResult.allPackages.entries()) {
    dependencies[name] = info.version;
  }
  cache.getJson('package.json', () => ({ dependencies }));

  const context = new EvidenceContextImpl(scanResult.repoRoot, new Set<string>(), cache);

  const factory = createDefaultFactory();
  const registry = new DetectorRegistry();
  registry.add(factory.createAll());

  const newResults = await registry.execute(context);

  const capabilities: Partial<Record<CapabilityCategory, CapabilityMatch[]>> = {};

  for (const result of newResults) {
    if (!result.matched) continue;

    const category = result.category as unknown as CapabilityCategory;
    if (!capabilities[category]) {
      capabilities[category] = [];
    }

    // Resolve matched packages for legacy compatibility
    const matchedPackages: string[] = [];
    const installedPackages = scanResult.allPackages;

    const detectorPackages: Record<string, string[]> = {
      nextjs: ['next'],
      react: ['react'],
      vite: ['vite'],
      express: ['express'],
      fastify: ['fastify'],
      nestjs: ['@nestjs/core'],
      postgres: ['pg', 'pg-native', 'postgres'],
      mysql: ['mysql', 'mysql2'],
      mariadb: ['mariadb'],
      sqlite: ['better-sqlite3', 'sqlite3', '@sqlite.org/sqlite-wasm'],
      mongodb: ['mongodb'],
      redis: ['redis', 'ioredis'],
      prisma: ['@prisma/client', 'prisma'],
      drizzle: ['drizzle-orm'],
      typeorm: ['typeorm'],
      sequelize: ['sequelize', 'sequelize-typescript'],
      mongoose: ['mongoose'],
      turborepo: ['turbo'],
      nx: ['nx'],
      lerna: ['lerna'],
    };

    const pkgs = detectorPackages[result.detectorId] || [];
    for (const pkg of pkgs) {
      if (installedPackages.has(pkg)) {
        matchedPackages.push(pkg);
      }
    }

    // Map matched detector ID to legacy role string
    let role = '';
    const detectorRoles: Record<string, string> = {
      nextjs: 'meta-framework',
      react: 'ui-library',
      vite: 'bundler',
      express: 'server-framework',
      fastify: 'server-framework',
      nestjs: 'server-framework',
      postgres: 'relational-driver',
      mysql: 'relational-driver',
      mariadb: 'relational-driver',
      sqlite: 'relational-driver',
      mongodb: 'document-driver',
      redis: 'redis-client',
      prisma: 'relational-orm',
      drizzle: 'relational-orm',
      typeorm: 'relational-orm',
      sequelize: 'relational-orm',
      mongoose: 'document-orm',
      turborepo: 'monorepo-tool',
      nx: 'monorepo-tool',
      lerna: 'monorepo-tool',
      npm: 'package-manager',
      pnpm: 'package-manager',
      yarn: 'package-manager',
      bun: 'package-manager',
      'github-actions': 'ci-cd',
      'gitlab-ci': 'ci-cd',
      'circle-ci': 'ci-cd',
      'azure-pipelines': 'ci-cd',
      vercel: 'deployment-platform',
      netlify: 'deployment-platform',
      docker: 'containerizer',
      'docker-compose': 'orchestrator',
      kubernetes: 'orchestrator',
      helm: 'package-manager',
    };

    const r = detectorRoles[result.detectorId];
    if (r !== undefined) {
      role = r;
    }

    capabilities[category]!.push({
      label: result.capability,
      matchedPackages,
      role,
    });
  }

  return {
    ...scanResult,
    capabilities,
  };
}
