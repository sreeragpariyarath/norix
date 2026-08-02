/**
 * Graph Builder
 *
 * Transforms an AnalysisResult into a deterministic ArchitectureGraph.
 *
 * Core design:
 *  - Stable node IDs (`repository`, `category:frontend`, `tech:react`)
 *  - Helper methods for encapsulation (`addNode`, `addEdge`, `ensureCategory`)
 *  - Consumes categories.ts and topology.ts for data-driven categorization
 *  - Sorts nodes and edges deterministically for reproducible outputs & snapshots
 */

import type { AnalysisResult, CapabilityMatch } from '../types.js';
import type { ArchitectureGraph, GraphEdge, GraphNode } from './types.js';
import { getLayerCategory } from './categories.js';
import { TOPOLOGY_RULES } from './topology.js';

export class GraphBuilder {
  /**
   * Builds a structured ArchitectureGraph from an AnalysisResult.
   */
  build(result: AnalysisResult): ArchitectureGraph {
    const nodesMap = new Map<string, GraphNode>();
    const edgesSet = new Set<string>();
    const edgesList: GraphEdge[] = [];

    // Helper: add node
    const addNode = (id: string, label: string, category: string): void => {
      if (!nodesMap.has(id)) {
        nodesMap.set(id, { id, label, category });
      }
    };

    // Helper: add edge
    const addEdge = (from: string, to: string, label?: string): void => {
      const key = `${from}->${to}:${label ?? ''}`;
      if (!edgesSet.has(key)) {
        edgesSet.add(key);
        edgesList.push(label ? { from, to, label } : { from, to });
      }
    };

    // Helper: ensure category node exists and links to repository root
    const ensureCategory = (catName: string): string => {
      const catId = `category:${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      addNode(catId, catName, 'Category');
      addEdge('repository', catId);
      return catId;
    };

    // 1. Root Repository Node
    addNode('repository', result.repoName, 'Repository');

    // Collect all detected capability matches across categories
    const allMatches: Array<{ categoryKey: string; match: CapabilityMatch }> = [];
    for (const [catKey, matches] of Object.entries(result.capabilities)) {
      if (Array.isArray(matches)) {
        for (const m of matches) {
          allMatches.push({ categoryKey: catKey, match: m });
        }
      }
    }

    const techNodeIdsByLabel = new Map<string, string>();

    // 2. Build Category & Capability Nodes/Edges
    for (const { categoryKey, match } of allMatches) {
      const layerName = getLayerCategory(categoryKey, match.role);
      const catId = ensureCategory(layerName);

      const techId = `tech:${match.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      techNodeIdsByLabel.set(match.label, techId);

      addNode(techId, match.label, layerName);
      addEdge(catId, techId);
    }

    // 3. Process Topology Connection Rules
    for (const rule of TOPOLOGY_RULES) {
      const sourceTechId = techNodeIdsByLabel.get(rule.technology);
      if (!sourceTechId) continue;

      for (const targetRef of rule.connectsTo) {
        if (targetRef.startsWith('category:')) {
          const catName = targetRef.replace('category:', '');
          const catNode = Array.from(nodesMap.values()).find(
            (n) => n.category === catName || n.label === catName,
          );
          if (catNode) {
            addEdge(sourceTechId, catNode.id);
          }
        } else {
          const targetTechId = techNodeIdsByLabel.get(targetRef);
          if (targetTechId) {
            addEdge(sourceTechId, targetTechId);
          }
        }
      }
    }

    // Sort nodes: repository first, then category nodes alphabetically, then tech nodes alphabetically
    const sortedNodes = Array.from(nodesMap.values()).sort((a, b) => {
      if (a.id === 'repository') return -1;
      if (b.id === 'repository') return 1;
      return a.id.localeCompare(b.id);
    });

    const sortedEdges = [...edgesList].sort((a, b) => {
      const cmpFrom = a.from.localeCompare(b.from);
      return cmpFrom !== 0 ? cmpFrom : a.to.localeCompare(b.to);
    });

    return {
      repoName: result.repoName,
      metadata: {
        engine: 'modern',
        generatedAt: new Date().toISOString(),
        nodeCount: sortedNodes.length,
        edgeCount: sortedEdges.length,
      },
      nodes: sortedNodes,
      edges: sortedEdges,
    };
  }
}
