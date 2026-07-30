import type { DbEntry } from '../types.js';

export const ormEntries: DbEntry[] = [
  { packages: ['@prisma/client', 'prisma'], label: 'Prisma', role: 'relational-orm' },
  { packages: ['drizzle-orm'], label: 'Drizzle', role: 'relational-orm' },
  { packages: ['typeorm'], label: 'TypeORM', role: 'relational-orm' },
  { packages: ['sequelize', 'sequelize-typescript'], label: 'Sequelize', role: 'relational-orm' },
  { packages: ['@mikro-orm/core'], label: 'MikroORM', role: 'relational-orm' },
  { packages: ['objection'], label: 'Objection.js', role: 'relational-orm' },
  { packages: ['mongoose'], label: 'Mongoose', role: 'document-orm' },
  { packages: ['kysely'], label: 'Kysely', role: 'query-builder' },
  { packages: ['knex'], label: 'Knex.js', role: 'query-builder' },
];
