/**
 * Command Handler: analyze
 *
 * Scans repository dependencies and outputs capability analysis.
 */

import { scan } from '../scanner.js';
import { analyze } from '../analyzer.js';
import { renderAnalysis } from '../renderer.js';
import type { AnalysisResult } from '../types.js';

function toJson(result: AnalysisResult, version: string): unknown {
  return {
    $schema: 'https://norix.dev/schemas/analyze/v1.json',
    version: '1',
    norixVersion: version,
    timestamp: new Date().toISOString(),
    repository: {
      name: result.repoName,
      root: result.repoRoot,
      isMonorepo: result.isMonorepo,
      workspaces: result.workspaceNames,
      workspaceDetails: result.workspaces.map((w) => ({
        name: w.name,
        path: w.relativePath,
        packageCount: w.packages.size,
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
}

export async function handleAnalyze(
  cwd: string,
  asJson: boolean,
  version: string,
): Promise<void> {
  const scanResult = await scan(cwd);
  const analysisResult = analyze(scanResult);

  if (asJson) {
    process.stdout.write(
      JSON.stringify(toJson(analysisResult, version), null, 2) + '\n',
    );
  } else {
    renderAnalysis(analysisResult);
  }
}
