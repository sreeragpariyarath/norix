import type { DbEntry } from '../types.js';

export const dateUtilityEntries: DbEntry[] = [
  { packages: ['date-fns'], label: 'date-fns', role: 'date-library' },
  { packages: ['dayjs'], label: 'Day.js', role: 'date-library' },
  { packages: ['moment'], label: 'Moment.js', role: 'date-library' },
  { packages: ['luxon'], label: 'Luxon', role: 'date-library' },
  { packages: ['temporal-polyfill', '@js-temporal/polyfill'], label: 'Temporal (polyfill)', role: 'date-library' },
];
