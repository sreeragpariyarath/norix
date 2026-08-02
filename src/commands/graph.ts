/**
 * Command Handler: graph
 *
 * Scans the repository using the modern engine, builds an ArchitectureGraph,
 * and renders it in the requested format (tree, mermaid, json).
 *
 * Pipeline:
 *   scan() → runNewEngine() → GraphBuilder.build() → createGraphRenderer(format).render()
 */

import { scan } from '../scanner.js';
import { runNewEngine } from '../engine/integration.js';
import { GraphBuilder } from '../graph/GraphBuilder.js';
import { createGraphRenderer } from '../graph/GraphRendererFactory.js';
import type { GraphFormat } from '../graph/types.js';

export async function handleGraph(cwd: string, format: GraphFormat): Promise<void> {
  const scanResult = await scan(cwd);
  const analysisResult = await runNewEngine(scanResult);

  const builder = new GraphBuilder();
  const graph = builder.build(analysisResult);

  const renderer = createGraphRenderer(format);
  const output = renderer.render(graph);

  process.stdout.write(output + (output.endsWith('\n') ? '' : '\n'));
}
