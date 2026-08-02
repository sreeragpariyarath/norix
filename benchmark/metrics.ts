import { CacheStatistics } from '../src/engine/cache/EvidenceCache.js';

/**
 * Metrics captured for a single repository run.
 */
export interface RepositoryMetrics {
  repositoryName: string;
  filesDiscovered: number;
  filesRead: number;
  legacyTimeMs: number;
  coldEngineTimeMs: number;
  warmEngineTimeMs: number;
  cacheStatistics: CacheStatistics;
  memoryUsageMb: number;
  detectorCount: number;
  evidenceCount: number;
  averageDetectorTimeMs: number;
  slowestDetectorName: string;
  slowestDetectorTimeMs: number;
}
