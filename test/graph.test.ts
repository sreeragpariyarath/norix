/**
 * Graph Engine & Renderers Test Suite
 *
 * Verifies ArchitectureGraph generation, stable IDs, metadata,
 * renderer implementations (Tree, Mermaid, JSON), and factory instantiation.
 */

import { describe, it, expect } from 'vitest';
import { analyze } from '../src/analyzer.js';
import type { ScanResult } from '../src/types.js';
import { GraphBuilder } from '../src/graph/GraphBuilder.js';
import { createGraphRenderer } from '../src/graph/GraphRendererFactory.js';
import { TreeRenderer } from '../src/graph/renderers/TreeRenderer.js';
import { MermaidRenderer } from '../src/graph/renderers/MermaidRenderer.js';
import { JsonRenderer } from '../src/graph/renderers/JsonRenderer.js';
import type { ArchitectureGraph } from '../src/graph/types.js';

function createMockScan(
  packages: Record<string, string>,
  options: Partial<
    Pick<ScanResult, 'language' | 'isMonorepo' | 'workspaceNames' | 'repoName'>
  > = {},
): ScanResult {
  const allPackages = new Map<string, { version: string; isDev: boolean }>();
  for (const [name, version] of Object.entries(packages)) {
    allPackages.set(name, { version, isDev: false });
  }
  return {
    repoName: options.repoName ?? 'test-repo',
    repoRoot: '/test',
    isMonorepo: options.isMonorepo ?? false,
    workspaceNames: options.workspaceNames ?? [],
    workspaces: [],
    allPackages,
    language: options.language ?? 'TypeScript',
    packageManager: 'npm',
    packageJsonCount: 1,
    duration: 10,
  };
}

function buildGraph(
  packages: Record<string, string>,
  options: Parameters<typeof createMockScan>[1] = {},
): ArchitectureGraph {
  const scan = createMockScan(packages, options);
  const result = analyze(scan);
  const builder = new GraphBuilder();
  return builder.build(result);
}

describe('GraphBuilder – Node & Edge Construction', () => {
  it('creates root repository node and metadata', () => {
    const graph = buildGraph({});
    expect(graph.repoName).toBe('test-repo');
    expect(graph.metadata.engine).toBe('modern');
    expect(graph.metadata.nodeCount).toBe(1);
    expect(graph.nodes[0]).toEqual({
      id: 'repository',
      label: 'test-repo',
      category: 'Repository',
    });
  });

  it('categorizes Next.js and React under Frontend', () => {
    const graph = buildGraph({ next: '14.0.0', react: '18.0.0' });
    const catNode = graph.nodes.find((n) => n.id === 'category:frontend');
    expect(catNode).toBeDefined();
    expect(catNode?.label).toBe('Frontend');

    const nextNode = graph.nodes.find((n) => n.id === 'tech:next-js');
    expect(nextNode).toBeDefined();

    const edge = graph.edges.find((e) => e.from === 'tech:next-js' && e.to === 'tech:react');
    expect(edge).toBeDefined();
  });

  it('connects Prisma ORM to Database category via topology rule', () => {
    const graph = buildGraph({ '@prisma/client': '5.0.0', pg: '8.0.0' });
    const prismaNode = graph.nodes.find((n) => n.id === 'tech:prisma');
    expect(prismaNode).toBeDefined();

    const dbCategory = graph.nodes.find((n) => n.id === 'category:database');
    expect(dbCategory).toBeDefined();

    const edge = graph.edges.find((e) => e.from === 'tech:prisma' && e.to === 'category:database');
    expect(edge).toBeDefined();
  });

  it('sorts nodes deterministically (repository first, then alphabetically)', () => {
    const graph = buildGraph({ express: '4.0.0', next: '14.0.0', pg: '8.0.0' });
    expect(graph.nodes[0]?.id).toBe('repository');

    const ids = graph.nodes.map((n) => n.id);
    const restIds = ids.slice(1);
    const sortedRest = [...restIds].sort((a, b) => a.localeCompare(b));
    expect(restIds).toEqual(sortedRest);
  });
});

describe('GraphRendererFactory', () => {
  it('instantiates TreeRenderer for "tree"', () => {
    const renderer = createGraphRenderer('tree');
    expect(renderer).toBeInstanceOf(TreeRenderer);
  });

  it('instantiates MermaidRenderer for "mermaid"', () => {
    const renderer = createGraphRenderer('mermaid');
    expect(renderer).toBeInstanceOf(MermaidRenderer);
  });

  it('instantiates JsonRenderer for "json"', () => {
    const renderer = createGraphRenderer('json');
    expect(renderer).toBeInstanceOf(JsonRenderer);
  });

  it('throws error for unsupported graph format', () => {
    expect(() => createGraphRenderer('unsupported' as unknown as GraphFormat)).toThrowError(
      'Unsupported graph format: "unsupported"',
    );
  });
});

describe('Renderers Output & Snapshot Assertions', () => {
  it('JsonRenderer outputs valid JSON matching metadata', () => {
    const graph = buildGraph({ express: '4.0.0', redis: '4.0.0' });
    const renderer = new JsonRenderer();
    const output = renderer.render(graph);
    const parsed = JSON.parse(output) as ArchitectureGraph;
    expect(parsed.repoName).toBe('test-repo');
    expect(parsed.nodes.length).toBe(graph.metadata.nodeCount);
  });

  it('MermaidRenderer produces valid graph TD flowchart text snapshot', () => {
    const graph = buildGraph({ next: '14.0.0', react: '18.0.0' }, { repoName: 'my-app' });
    const renderer = new MermaidRenderer();
    const output = renderer.render(graph);

    expect(output).toContain('graph TD');
    expect(output).toContain('Repo["📦 my-app"]');
    expect(output).toContain('category_frontend["📂 Frontend"]');
    expect(output).toContain('tech_next_js["⚡ Next.js"]');
    expect(output).toContain('tech_next_js --> tech_react');
  });

  it('TreeRenderer produces formatted terminal tree snapshot', () => {
    const graph = buildGraph({ express: '4.0.0' }, { repoName: 'api-service' });
    const renderer = new TreeRenderer();
    const output = renderer.render(graph);

    expect(output).toContain('Architecture Graph');
    expect(output).toContain('api-service');
    expect(output).toContain('Backend');
    expect(output).toContain('Express.js');
  });
});
