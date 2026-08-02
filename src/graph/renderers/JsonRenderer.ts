/**
 * JSON Renderer
 *
 * Serializes an ArchitectureGraph into pretty JSON.
 */

import type { ArchitectureGraph } from '../types.js';
import type { GraphRenderer } from '../GraphRenderer.js';

export class JsonRenderer implements GraphRenderer {
  render(graph: ArchitectureGraph): string {
    return JSON.stringify(graph, null, 2);
  }
}
