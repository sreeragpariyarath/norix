import { describe, it, expect } from 'vitest';
import { tmpdir } from 'node:os';
import { Profiler } from '../benchmark/profiler.js';
import { EvidenceCache } from '../src/engine/cache/EvidenceCache.js';
import { generateReport } from '../benchmark/report.js';
import { RepositoryMetrics } from '../benchmark/metrics.js';

describe('Performance Benchmarking & Profiling Suite', () => {
  describe('Profiler', () => {
    it('should start, track laps, and stop correctly', async () => {
      const profiler = new Profiler();
      profiler.start();

      profiler.lap('lap1');
      await new Promise((r) => setTimeout(r, 10));

      profiler.lap('lap2');
      await new Promise((r) => setTimeout(r, 15));

      profiler.stop();

      const summary = profiler.summary();
      expect(summary.total).toBeGreaterThanOrEqual(20);
      expect(summary.laps.lap1).toBeGreaterThan(0);
      expect(summary.laps.lap2).toBeGreaterThan(0);
    });
  });

  describe('EvidenceCache Statistics', () => {
    it('should track hit and miss counts and return a frozen snapshot', () => {
      const cache = new EvidenceCache();

      // Initial stats
      let stats = cache.getStatistics();
      expect(stats.fileMisses).toBe(0);
      expect(stats.fileHits).toBe(0);
      expect(Object.isFrozen(stats)).toBe(true);

      // Trigger file existence queries
      cache.hasFile('file1.json', () => true); // Miss
      cache.hasFile('file1.json', () => true); // Hit

      stats = cache.getStatistics();
      expect(stats.fileMisses).toBe(1);
      expect(stats.fileHits).toBe(1);

      // Trigger JSON query
      cache.getJson('config.json', () => ({ val: 123 })); // Miss
      cache.getJson('config.json', () => ({ val: 123 })); // Hit

      stats = cache.getStatistics();
      expect(stats.jsonMisses).toBe(1);
      expect(stats.jsonHits).toBe(1);

      // Clear resets stats
      cache.clear();
      stats = cache.getStatistics();
      expect(stats.fileHits).toBe(0);
      expect(stats.jsonHits).toBe(0);
    });
  });

  describe('Report Generation', () => {
    it('should generate a valid markdown report with summary statistics', () => {
      const mockMetrics: RepositoryMetrics[] = [
        {
          repositoryName: 'mock-repo-1',
          filesDiscovered: 10,
          filesRead: 5,
          legacyTimeMs: 100,
          coldEngineTimeMs: 80,
          warmEngineTimeMs: 20,
          cacheStatistics: {
            fileHits: 5,
            fileMisses: 2,
            jsonHits: 1,
            jsonMisses: 1,
            yamlHits: 0,
            yamlMisses: 0,
            regexHits: 10,
            regexMisses: 2,
            contentHits: 5,
            contentMisses: 2,
          },
          memoryUsageMb: 50,
          detectorCount: 10,
          evidenceCount: 3,
          averageDetectorTimeMs: 1.5,
          slowestDetectorName: 'MockDetector',
          slowestDetectorTimeMs: 4.5,
        },
      ];

      // Generates report and writes to results.md in test context
      const md = generateReport(mockMetrics, tmpdir());
      expect(md).toContain('# Norix Performance Benchmarking Report');
      expect(md).toContain('mock-repo-1');
      expect(md).toContain('80.0%'); // (100 - 20) / 100 = 80% improvement
      expect(md).toContain('MockDetector');
    });
  });
});
