/**
 * Domain Models & Types for Architecture Graph
 */

export const GRAPH_FORMATS = ['tree', 'mermaid', 'json'] as const;
export type GraphFormat = (typeof GRAPH_FORMATS)[number];

export interface GraphNode {
  readonly id: string;
  readonly label: string;
  readonly category: string;
}

export interface GraphEdge {
  readonly from: string;
  readonly to: string;
  readonly label?: string;
}

export interface GraphMetadata {
  readonly engine: 'modern';
  readonly generatedAt: string;
  readonly nodeCount: number;
  readonly edgeCount: number;
}

export interface ArchitectureGraph {
  readonly repoName: string;
  readonly metadata: GraphMetadata;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}
