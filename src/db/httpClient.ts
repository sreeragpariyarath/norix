import type { DbEntry } from '../types.js';

export const httpClientEntries: DbEntry[] = [
  { packages: ['axios'], label: 'Axios', role: 'http-client' },
  { packages: ['got'], label: 'Got', role: 'http-client' },
  { packages: ['ky'], label: 'ky', role: 'http-client' },
  { packages: ['node-fetch'], label: 'node-fetch', role: 'http-client' },
  { packages: ['undici'], label: 'undici', role: 'http-client' },
  { packages: ['superagent'], label: 'SuperAgent', role: 'http-client' },
];
