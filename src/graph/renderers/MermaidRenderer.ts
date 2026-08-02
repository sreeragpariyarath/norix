/**
 * Mermaid Renderer
 *
 * Formats an ArchitectureGraph into valid Mermaid graph TD syntax.
 */

import type { ArchitectureGraph } from '../types.js';
import type { GraphRenderer } from '../GraphRenderer.js';

export class MermaidRenderer implements GraphRenderer {
  render(graph: ArchitectureGraph): string {
    const lines: string[] = [];

    lines.push('graph TD');
    lines.push('');

    // Sanitize node IDs for Mermaid (replace colons and special chars with underscores)
    const sanitizeId = (id: string): string => {
      if (id === 'repository') return 'Repo';
      return id.replace(/[^a-zA-Z0-9_]/g, '_');
    };

    // Node definitions
    lines.push(`    Repo["📦 ${this.escapeLabel(graph.repoName)}"]`);

    const sortedNodes = [...graph.nodes]
      .filter((n) => n.id !== 'repository')
      .sort((a, b) => a.id.localeCompare(b.id));

    for (const node of sortedNodes) {
      const sId = sanitizeId(node.id);
      if (node.id.startsWith('category:')) {
        lines.push(`    ${sId}["📂 ${this.escapeLabel(node.label)}"]`);
      } else {
        lines.push(`    ${sId}["⚡ ${this.escapeLabel(node.label)}"]`);
      }
    }

    lines.push('');

    // Edges
    const sortedEdges = [...graph.edges].sort((a, b) => {
      const cmpFrom = a.from.localeCompare(b.from);
      return cmpFrom !== 0 ? cmpFrom : a.to.localeCompare(b.to);
    });

    for (const edge of sortedEdges) {
      const fromId = sanitizeId(edge.from);
      const toId = sanitizeId(edge.to);
      if (edge.label) {
        lines.push(`    ${fromId} -- "${this.escapeLabel(edge.label)}" --> ${toId}`);
      } else {
        lines.push(`    ${fromId} --> ${toId}`);
      }
    }

    return lines.join('\n');
  }

  private escapeLabel(label: string): string {
    return label.replace(/"/g, '\\"');
  }
}
