/**
 * Command Handler: insights
 *
 * Scans the repository using the modern engine, generates an ArchitectureReport,
 * and renders it in the requested format.
 *
 * Pipeline:
 *   scan() → runNewEngine() → InsightEngine.generate() → render / json / markdown
 *
 * Supported formats:
 *   summary   (default) — terminal color output
 *   json                — raw JSON to stdout
 *   markdown            — GitHub-flavored markdown to stdout
 */

import { scan } from '../scanner.js';
import { runNewEngine } from '../engine/integration.js';
import { InsightEngine } from '../insights/InsightEngine.js';
import { renderInsights } from '../insights/renderer.js';
import { generateInsightsMarkdown } from '../insights/markdown.js';

export async function handleInsights(cwd: string, format: string, version: string): Promise<void> {
  const start = Date.now();
  const scanResult = await scan(cwd);
  const analysisResult = await runNewEngine(scanResult);
  const durationMs = Date.now() - start;

  const engine = new InsightEngine();
  const report = engine.generate(analysisResult, durationMs, `v${version}`);

  switch (format) {
    case 'json':
      process.stdout.write(JSON.stringify(report, null, 2) + '\n');
      break;
    case 'markdown':
      process.stdout.write(generateInsightsMarkdown(report) + '\n');
      break;
    default:
      renderInsights(report);
  }
}
