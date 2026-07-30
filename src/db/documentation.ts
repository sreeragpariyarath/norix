import type { DbEntry } from '../types.js';

export const documentationEntries: DbEntry[] = [
  {
    packages: ['@storybook/react', '@storybook/vue3', '@storybook/svelte', '@storybook/nextjs', 'storybook'],
    label: 'Storybook',
    role: 'component-docs',
  },
  { packages: ['typedoc'], label: 'TypeDoc', role: 'api-docs' },
  { packages: ['vitepress'], label: 'VitePress', role: 'docs-site' },
  { packages: ['nextra'], label: 'Nextra', role: 'docs-site' },
  { packages: ['@docusaurus/core'], label: 'Docusaurus', role: 'docs-site' },
  { packages: ['fumadocs-core', 'fumadocs-mdx'], label: 'Fumadocs', role: 'docs-site' },
];
