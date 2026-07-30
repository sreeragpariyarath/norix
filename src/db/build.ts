import type { DbEntry } from '../types.js';

export const buildEntries: DbEntry[] = [
  { packages: ['vite'], label: 'Vite', role: 'bundler' },
  { packages: ['webpack', 'webpack-cli'], label: 'Webpack', role: 'bundler' },
  { packages: ['esbuild'], label: 'esbuild', role: 'bundler' },
  { packages: ['rollup'], label: 'Rollup', role: 'bundler' },
  { packages: ['parcel', 'parcel-bundler'], label: 'Parcel', role: 'bundler' },
  { packages: ['@rspack/core', 'rspack'], label: 'Rspack', role: 'bundler' },
  { packages: ['tsup'], label: 'tsup', role: 'ts-bundler' },
  { packages: ['turbo'], label: 'Turborepo', role: 'monorepo-tool' },
  { packages: ['nx'], label: 'Nx', role: 'monorepo-tool' },
];
