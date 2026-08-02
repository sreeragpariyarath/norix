/**
 * Graph Renderer Factory
 *
 * Factory creating GraphRenderer instances based on requested GraphFormat.
 */

import type { GraphFormat } from './types.js';
import type { GraphRenderer } from './GraphRenderer.js';
import { TreeRenderer } from './renderers/TreeRenderer.js';
import { MermaidRenderer } from './renderers/MermaidRenderer.js';
import { JsonRenderer } from './renderers/JsonRenderer.js';

export function createGraphRenderer(format: GraphFormat): GraphRenderer {
  switch (format) {
    case 'tree':
      return new TreeRenderer();
    case 'mermaid':
      return new MermaidRenderer();
    case 'json':
      return new JsonRenderer();
    default:
      throw new Error(`Unsupported graph format: "${String(format)}"`);
  }
}
