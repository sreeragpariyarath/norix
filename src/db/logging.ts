import type { DbEntry } from '../types.js';

export const loggingEntries: DbEntry[] = [
  { packages: ['pino', 'pino-http'], label: 'Pino', role: 'app-logger' },
  { packages: ['winston'], label: 'Winston', role: 'app-logger' },
  { packages: ['bunyan'], label: 'Bunyan', role: 'app-logger' },
  { packages: ['consola'], label: 'Consola', role: 'app-logger' },
  { packages: ['signale'], label: 'Signale', role: 'app-logger' },
  { packages: ['loglevel'], label: 'loglevel', role: 'app-logger' },
  { packages: ['morgan'], label: 'Morgan (HTTP)', role: 'http-middleware' },
];
