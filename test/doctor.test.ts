import { describe, it, expect } from 'vitest';
import { runDoctor } from '../src/doctor.js';
import type { AnalysisResult } from '../src/types.js';

describe('runDoctor', () => {
  const createMockAnalysisResult = (
    capabilities: AnalysisResult['capabilities'],
  ): AnalysisResult => {
    return {
      repoName: 'test-repo',
      repoRoot: '/path/to/test-repo',
      isMonorepo: false,
      workspaceNames: [],
      workspaces: [],
      allPackages: new Map(),
      language: 'TypeScript',
      packageManager: 'npm',
      packageJsonCount: 1,
      duration: 10,
      capabilities,
    };
  };

  it('should not flag different roles inside the same category as an overlap', () => {
    const analysis = createMockAnalysisResult({
      framework: [
        { label: 'React', matchedPackages: ['react'], role: 'ui-library' },
        { label: 'Express.js', matchedPackages: ['express'], role: 'server-framework' },
      ],
    });

    const result = runDoctor(analysis);

    expect(result.findings).toHaveLength(0);
    expect(result.summary.total).toBe(0);
  });

  it('should flag same roles inside the same category as an overlap', () => {
    const analysis = createMockAnalysisResult({
      framework: [
        { label: 'Express.js', matchedPackages: ['express'], role: 'server-framework' },
        { label: 'Fastify', matchedPackages: ['fastify'], role: 'server-framework' },
      ],
    });

    const result = runDoctor(analysis);

    expect(result.findings).toHaveLength(1);
    expect(result.summary.total).toBe(1);
    expect(result.summary.warning).toBe(1);
    expect(result.summary.info).toBe(0);

    const finding = result.findings[0]!;
    expect(finding.id).toBe('capability-overlap/framework/server-framework');
    expect(finding.category).toBe('framework');
    expect(finding.severity).toBe('warning');
    expect(finding.evidence).toHaveLength(2);
    expect(finding.evidence).toContainEqual({ package: 'express' });
    expect(finding.evidence).toContainEqual({ package: 'fastify' });
  });

  it('should return info severity for category testing when test runners overlap', () => {
    const analysis = createMockAnalysisResult({
      testing: [
        { label: 'Jest', matchedPackages: ['jest'], role: 'test-runner' },
        { label: 'Vitest', matchedPackages: ['vitest'], role: 'test-runner' },
      ],
    });

    const result = runDoctor(analysis);

    expect(result.findings).toHaveLength(1);
    expect(result.summary.total).toBe(1);
    expect(result.summary.warning).toBe(0);
    expect(result.summary.info).toBe(1);

    const finding = result.findings[0]!;
    expect(finding.id).toBe('capability-overlap/testing/test-runner');
    expect(finding.severity).toBe('info');
  });

  it('should handle empty capabilities without crashing', () => {
    const analysis = createMockAnalysisResult({});
    const result = runDoctor(analysis);

    expect(result.findings).toHaveLength(0);
    expect(result.summary.total).toBe(0);
  });
});
