import type { DbEntry } from '../types.js';

export const frameworkEntries: DbEntry[] = [
  { packages: ['next'], label: 'Next.js', role: 'meta-framework' },
  { packages: ['nuxt', 'nuxt3'], label: 'Nuxt', role: 'meta-framework' },
  {
    packages: ['@remix-run/node', '@remix-run/react', 'remix'],
    label: 'Remix',
    role: 'meta-framework',
  },
  { packages: ['astro'], label: 'Astro', role: 'meta-framework' },
  { packages: ['@sveltejs/kit'], label: 'SvelteKit', role: 'meta-framework' },
  { packages: ['express'], label: 'Express.js', role: 'server-framework' },
  { packages: ['fastify'], label: 'Fastify', role: 'server-framework' },
  { packages: ['hono'], label: 'Hono', role: 'server-framework' },
  { packages: ['koa'], label: 'Koa', role: 'server-framework' },
  { packages: ['@nestjs/core'], label: 'NestJS', role: 'server-framework' },
  { packages: ['elysia'], label: 'Elysia', role: 'server-framework' },
  { packages: ['h3'], label: 'h3', role: 'server-framework' },
  { packages: ['@hapi/hapi'], label: 'Hapi.js', role: 'server-framework' },
  { packages: ['sails'], label: 'Sails.js', role: 'server-framework' },
  { packages: ['@adonisjs/core'], label: 'AdonisJS', role: 'server-framework' },
  { packages: ['react'], label: 'React', role: 'ui-library' },
  { packages: ['vue'], label: 'Vue.js', role: 'ui-library' },
  { packages: ['solid-js'], label: 'SolidJS', role: 'ui-library' },
  { packages: ['svelte'], label: 'Svelte', role: 'ui-library' },
  { packages: ['@angular/core'], label: 'Angular', role: 'ui-library' },
  { packages: ['@trpc/server'], label: 'tRPC', role: 'api-layer' },
  {
    packages: ['graphql', '@apollo/server', 'apollo-server'],
    label: 'GraphQL / Apollo',
    role: 'api-layer',
  },
];
