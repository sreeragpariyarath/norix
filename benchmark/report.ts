import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RepositoryMetrics } from './metrics.js';

function getPercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[index] ?? 0;
}

/**
 * Computes statistical summaries and generates the Markdown report results.md.
 */
export function generateReport(metricsList: RepositoryMetrics[], outputDir: string): string {
  // 1. Calculate improvements (Legacy vs Warm Engine)
  const improvements = metricsList.map((m) => {
    const legacy = m.legacyTimeMs;
    const warm = m.warmEngineTimeMs;
    return legacy > 0 ? ((legacy - warm) / legacy) * 100 : 0;
  });

  const avgImprovement = improvements.reduce((a, b) => a + b, 0) / (improvements.length || 1);
  const medianImprovement = getPercentile(improvements, 50);
  const bestImprovement = Math.max(...improvements, 0);
  const worstImprovement = Math.min(...improvements, 0);
  const p95Improvement = getPercentile(improvements, 95);

  // 2. Identify slowest detector across all runs
  let slowestDetectorName = 'N/A';
  let slowestDetectorTimeMs = 0;
  let totalDetectorTimeMs = 0;
  let detectorMeasurementsCount = 0;

  for (const m of metricsList) {
    if (m.slowestDetectorTimeMs > slowestDetectorTimeMs) {
      slowestDetectorTimeMs = m.slowestDetectorTimeMs;
      slowestDetectorName = m.slowestDetectorName;
    }
    totalDetectorTimeMs += m.averageDetectorTimeMs;
    if (m.averageDetectorTimeMs > 0) {
      detectorMeasurementsCount++;
    }
  }

  const avgDetectorTime =
    detectorMeasurementsCount > 0 ? totalDetectorTimeMs / detectorMeasurementsCount : 0;

  // 3. Build Markdown Report
  let md = `# Norix Performance Benchmarking Report\n\n`;
  md += `This report lists the performance metrics comparing the Legacy engine and the Modern engine (with Cold and Warm cache runs).\n\n`;

  md += `## Individual Repository Metrics\n\n`;
  md += `| Repository | Files | Legacy | Cold Engine | Warm Engine | Cache Hit Rate | Memory | Evidence |\n`;
  md += `| :--- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |\n`;

  for (const m of metricsList) {
    const stats = m.cacheStatistics;
    const hits =
      stats.fileHits + stats.jsonHits + stats.yamlHits + stats.regexHits + stats.contentHits;
    const total =
      hits +
      stats.fileMisses +
      stats.jsonMisses +
      stats.yamlMisses +
      stats.regexMisses +
      stats.contentMisses;
    const hitRate = total > 0 ? `${Math.round((hits / total) * 100)}%` : '100%';

    md += `| ${m.repositoryName} | ${m.filesDiscovered} | ${m.legacyTimeMs.toFixed(1)}ms | ${m.coldEngineTimeMs.toFixed(1)}ms | ${m.warmEngineTimeMs.toFixed(1)}ms | ${hitRate} | ${m.memoryUsageMb.toFixed(1)}MB | ${m.evidenceCount} |\n`;
  }

  md += `\n`;

  md += `## Summary Statistics (Legacy vs Warm Engine)\n\n`;
  md += `| Metric | Value |\n`;
  md += `| :--- | ---: |\n`;
  md += `| **Average Improvement** | ${avgImprovement.toFixed(1)}% |\n`;
  md += `| **Median Improvement** | ${medianImprovement.toFixed(1)}% |\n`;
  md += `| **Best Improvement** | ${bestImprovement.toFixed(1)}% |\n`;
  md += `| **Worst Improvement** | ${worstImprovement.toFixed(1)}% |\n`;
  md += `| **95th Percentile Improvement** | ${p95Improvement.toFixed(1)}% |\n`;
  md += `| **Average Detector Execution** | ${avgDetectorTime.toFixed(2)}ms |\n`;
  md += `| **Slowest Detector** | ${slowestDetectorName} (${slowestDetectorTimeMs.toFixed(2)}ms) |\n`;

  writeFileSync(join(outputDir, 'results.md'), md, 'utf-8');
  return md;
}
