/**
 * Graph Renderer Contract
 *
 * Interface implemented by all visualization formatters (Tree, Mermaid, JSON).
 */

import type { ArchitectureGraph } from './types.js';

export interface GraphRenderer {
  /**
   * Formats an ArchitectureGraph object model into a target string payload.
   */
  render(graph: ArchitectureGraph): string;
}
