import type { DbEntry } from '../types.js';

export const validationEntries: DbEntry[] = [
  { packages: ['zod'], label: 'Zod', role: 'schema-validator' },
  { packages: ['yup'], label: 'Yup', role: 'schema-validator' },
  { packages: ['joi'], label: 'Joi', role: 'schema-validator' },
  { packages: ['valibot'], label: 'Valibot', role: 'schema-validator' },
  { packages: ['class-validator'], label: 'class-validator', role: 'schema-validator' },
  { packages: ['ajv'], label: 'AJV (JSON Schema)', role: 'schema-validator' },
  { packages: ['superstruct'], label: 'Superstruct', role: 'schema-validator' },
  { packages: ['@sinclair/typebox'], label: 'TypeBox', role: 'schema-validator' },
  { packages: ['arktype'], label: 'ArkType', role: 'schema-validator' },
];
