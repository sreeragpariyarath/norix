import { describe, it, expect } from 'vitest';
import { analyze } from '../src/analyzer.js';
import type { ScanResult } from '../src/types.js';

describe('analyze', () => {
  const createMockScanResult = (packages: Record<string, string>): ScanResult => {
    const allPackages = new Map<string, { version: string; isDev: boolean }>();
    for (const [name, version] of Object.entries(packages)) {
      allPackages.set(name, { version, isDev: false });
    }

    return {
      repoName: 'test-repo',
      repoRoot: '/path/to/test-repo',
      isMonorepo: false,
      workspaceNames: [],
      workspaces: [],
      allPackages,
      language: 'TypeScript',
      packageManager: 'npm',
      packageJsonCount: 1,
      duration: 10,
    };
  };

  it('should detect a matching capability package', () => {
    const scan = createMockScanResult({
      next: '14.0.0',
      typescript: '5.0.0',
    });

    const result = analyze(scan);
    const framework = result.capabilities.framework;

    expect(framework).toBeDefined();
    if (!framework) throw new Error('framework undefined');

    expect(framework).toHaveLength(1);
    expect(framework[0]!).toEqual({
      label: 'Next.js',
      matchedPackages: ['next'],
      role: 'meta-framework',
    });
  });

  it('should deduplicate multiple packages with the same label', () => {
    // Both prisma and @prisma/client match "Prisma" ORM
    const scan = createMockScanResult({
      prisma: '5.0.0',
      '@prisma/client': '5.0.0',
    });

    const result = analyze(scan);
    const orm = result.capabilities.orm;

    expect(orm).toBeDefined();
    if (!orm) throw new Error('orm undefined');

    expect(orm).toHaveLength(1);
    expect(orm[0]!.label).toBe('Prisma');
    expect(orm[0]!.matchedPackages).toContain('prisma');
  });

  it('should return empty capabilities when no known packages are present', () => {
    const scan = createMockScanResult({
      'some-unknown-pkg': '1.0.0',
    });

    const result = analyze(scan);

    expect(result.capabilities).toEqual({});
  });

  it('should group multiple capabilities by their categories correctly', () => {
    const scan = createMockScanResult({
      next: '14.0.0',
      prisma: '5.0.0',
      zod: '3.0.0',
    });

    const result = analyze(scan);
    const { framework, orm, validation } = result.capabilities;

    expect(framework).toBeDefined();
    expect(orm).toBeDefined();
    expect(validation).toBeDefined();

    if (!framework || !orm || !validation) {
      throw new Error('Capabilities undefined');
    }

    expect(framework).toHaveLength(1);
    expect(orm).toHaveLength(1);
    expect(validation).toHaveLength(1);

    expect(framework[0]!.label).toBe('Next.js');
    expect(orm[0]!.label).toBe('Prisma');
    expect(validation[0]!.label).toBe('Zod');
  });
});
