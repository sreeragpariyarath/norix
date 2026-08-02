import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

/**
 * Output formatter that produces structured JSON reports suited for API consumption.
 */
export class JsonFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    const data = {
      $schema: 'https://norix.dev/schemas/analyze/v1.json',
      version: '1',
      norixVersion: '2.0.0',
      timestamp: new Date().toISOString(),
      repository: {
        name: result.repoName,
        root: result.repoRoot,
        isMonorepo: result.isMonorepo,
        workspaces: result.workspaceNames,
        workspaceDetails: result.workspaces.map((w) => ({
          name: w.name,
          path: w.relativePath,
          packageCount: w.packages ? w.packages.size : 0,
        })),
        language: result.language,
        packageManager: result.packageManager,
      },
      capabilities: result.capabilities,
      meta: {
        packageJsonCount: result.packageJsonCount,
        durationMs: Math.round(result.duration),
      },
    };
    return JSON.stringify(data, null, 2) + '\n';
  }
}
