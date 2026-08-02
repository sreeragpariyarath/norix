/**
 * Command Handler: analyze
 *
 * Scans repository dependencies and outputs capability analysis.
 */

import { scan } from '../scanner.js';
import { renderAnalysis } from '../renderer.js';
import { analyze } from '../analyzer.js';

import { runNewEngine } from '../engine/integration.js';
import { getFormatter } from '../output/index.js';

export async function handleAnalyze(
  cwd: string,
  format: string,
  version: string,
  engine = 'legacy',
): Promise<void> {
  const scanResult = await scan(cwd);
  const analysisResult = engine === 'new' ? await runNewEngine(scanResult) : analyze(scanResult);

  if (format === 'summary' && engine === 'legacy') {
    renderAnalysis(analysisResult);
  } else {
    const formatter = getFormatter(format);
    const output = formatter.format(analysisResult);
    process.stdout.write(output);
  }
}
