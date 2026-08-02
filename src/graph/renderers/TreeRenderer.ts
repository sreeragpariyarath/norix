/**
 * Tree Renderer
 *
 * Formats an ArchitectureGraph as a clean Unicode terminal tree.
 */

import pc from 'picocolors';
import type { ArchitectureGraph } from '../types.js';
import type { GraphRenderer } from '../GraphRenderer.js';

export class TreeRenderer implements GraphRenderer {
  render(graph: ArchitectureGraph): string {
    const lines: string[] = [];

    // Header
    lines.push('');
    lines.push(
      `  ${pc.cyan(pc.bold('norix'))}  ${pc.dim('·  Architecture Graph  ·  ' + graph.repoName)}`,
    );
    lines.push('');
    lines.push(`  ${pc.dim('─'.repeat(52))}`);
    lines.push('');

    // Root node
    lines.push(`  ${pc.bold(pc.white(graph.repoName))}`);

    // Group nodes by category
    const categoryMap = new Map<string, Array<{ id: string; label: string }>>();
    const categoryNodes = graph.nodes.filter((n) => n.id.startsWith('category:'));

    for (const catNode of categoryNodes) {
      const childNodes = graph.edges
        .filter((e) => e.from === catNode.id && e.to.startsWith('tech:'))
        .map((e) => graph.nodes.find((n) => n.id === e.to))
        .filter((n): n is { id: string; label: string; category: string } => n !== undefined);

      if (childNodes.length > 0) {
        categoryMap.set(catNode.label, childNodes);
      }
    }

    const categoryEntries = Array.from(categoryMap.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );

    categoryEntries.forEach(([catName, children], catIdx) => {
      const isLastCat = catIdx === categoryEntries.length - 1;
      const catPrefix = isLastCat ? '└── ' : '├── ';
      const childIndent = isLastCat ? '    ' : '│   ';

      lines.push(`  ${pc.dim(catPrefix)}${pc.bold(pc.white(catName))}`);

      const sortedChildren = [...children].sort((a, b) => a.label.localeCompare(b.label));

      sortedChildren.forEach((child, childIdx) => {
        const isLastChild = childIdx === sortedChildren.length - 1;
        const itemPrefix = isLastChild ? '└── ' : '├── ';
        lines.push(`  ${pc.dim(childIndent + itemPrefix)}${pc.cyan(child.label)}`);
      });
    });

    lines.push('');
    lines.push(`  ${pc.dim('─'.repeat(52))}`);
    lines.push(
      `  ${pc.dim(`${graph.metadata.nodeCount} nodes  ·  ${graph.metadata.edgeCount} connections`)}`,
    );
    lines.push('');

    return lines.join('\n');
  }
}
