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
import { createDefaultFactory } from '../engine/registry/loader.js';
import { PluginLoader } from '../plugins/PluginLoader.js';
import { PluginRegistry } from '../plugins/PluginRegistry.js';

export async function handleAnalyze(
  cwd: string,
  format: string,
  version: string,
  engine = 'legacy',
): Promise<void> {
  const scanResult = await scan(cwd);

  let analysisResult;
  if (engine === 'new') {
    const defaultFactory = createDefaultFactory();
    const coreConstructors = defaultFactory.getConstructors();
    const pluginRegistry = new PluginRegistry(defaultFactory.createAll());

    const loader = new PluginLoader();
    await loader.loadPlugins(cwd, pluginRegistry, version);

    const detectorConstructors = [...coreConstructors, ...pluginRegistry.getDetectorConstructors()];

    analysisResult = await runNewEngine(scanResult, { detectorConstructors });
  } else {
    analysisResult = analyze(scanResult);
  }

  if (format === 'summary' && engine === 'legacy') {
    renderAnalysis(analysisResult);
  } else {
    const formatter = getFormatter(format);
    const output = formatter.format(analysisResult);
    process.stdout.write(output);
  }
}
