/**
 * Archetype Detection
 *
 * Data-driven rules that classify a repository into a human-readable
 * project archetype (e.g. "Full-stack React application").
 *
 * Rules are evaluated in descending priority order; first match wins.
 */

import type { ProjectProfile } from './types.js';

export interface ArchetypeRule {
  readonly id: string;
  readonly priority: number;
  readonly archetype: string;
  matches(profile: ProjectProfile): boolean;
}

const ARCHETYPE_RULES: readonly ArchetypeRule[] = [
  {
    id: 'nextjs',
    priority: 100,
    archetype: 'Full-stack React application',
    matches: (p) => p.metaFrameworks.some((f) => f.label === 'Next.js'),
  },
  {
    id: 'nuxt',
    priority: 95,
    archetype: 'Nuxt.js application',
    matches: (p) => p.metaFrameworks.some((f) => f.label === 'Nuxt'),
  },
  {
    id: 'sveltekit',
    priority: 95,
    archetype: 'SvelteKit application',
    matches: (p) => p.metaFrameworks.some((f) => f.label === 'SvelteKit'),
  },
  {
    id: 'remix',
    priority: 95,
    archetype: 'Remix application',
    matches: (p) => p.metaFrameworks.some((f) => f.label === 'Remix'),
  },
  {
    id: 'astro',
    priority: 90,
    archetype: 'Astro site',
    matches: (p) => p.metaFrameworks.some((f) => f.label === 'Astro'),
  },
  {
    id: 'nestjs',
    priority: 85,
    archetype: 'NestJS API server',
    matches: (p) => p.serverFrameworks.some((f) => f.label === 'NestJS'),
  },
  {
    id: 'mern',
    priority: 80,
    archetype: 'MERN-style backend',
    matches: (p) =>
      p.serverFrameworks.some((f) => f.label === 'Express.js') &&
      p.documentDbs.some((d) => d.label === 'MongoDB'),
  },
  {
    id: 'react-vite',
    priority: 75,
    archetype: 'React SPA (Vite)',
    matches: (p) =>
      p.uiLibraries.some((f) => f.label === 'React') && p.bundlers.some((b) => b.label === 'Vite'),
  },
  {
    id: 'express',
    priority: 70,
    archetype: 'Express REST API',
    matches: (p) => p.serverFrameworks.some((f) => f.label === 'Express.js'),
  },
  {
    id: 'fastify',
    priority: 70,
    archetype: 'Fastify server',
    matches: (p) => p.serverFrameworks.some((f) => f.label === 'Fastify'),
  },
  {
    id: 'hono',
    priority: 68,
    archetype: 'Hono API server',
    matches: (p) => p.serverFrameworks.some((f) => f.label === 'Hono'),
  },
  {
    id: 'react-spa',
    priority: 60,
    archetype: 'React SPA',
    matches: (p) => p.uiLibraries.some((f) => f.label === 'React'),
  },
  {
    id: 'vue',
    priority: 58,
    archetype: 'Vue.js application',
    matches: (p) => p.uiLibraries.some((f) => f.label === 'Vue.js'),
  },
  {
    id: 'angular',
    priority: 58,
    archetype: 'Angular application',
    matches: (p) => p.uiLibraries.some((f) => f.label === 'Angular'),
  },
  {
    id: 'monorepo',
    priority: 50,
    archetype: 'Monorepo',
    matches: (p) => p.isMonorepo || p.monorepoTools.length > 0,
  },
  {
    id: 'node-fallback',
    priority: 0,
    archetype: 'Node.js project',
    matches: () => true,
  },
];

/**
 * Returns the highest-priority archetype string that matches the given profile.
 * Always returns a non-empty string (falls back to "Node.js project").
 */
export function detectArchetype(profile: ProjectProfile): string {
  const matched = [...ARCHETYPE_RULES]
    .sort((a, b) => b.priority - a.priority)
    .find((rule) => rule.matches(profile));
  return matched?.archetype ?? 'Node.js project';
}
