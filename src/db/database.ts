import type { DbEntry } from '../types.js';

export const databaseEntries: DbEntry[] = [
  { packages: ['pg', 'pg-native', 'postgres'], label: 'PostgreSQL', role: 'relational-driver' },
  { packages: ['mysql', 'mysql2'], label: 'MySQL', role: 'relational-driver' },
  {
    packages: ['better-sqlite3', 'sqlite3', '@sqlite.org/sqlite-wasm'],
    label: 'SQLite',
    role: 'relational-driver',
  },
  { packages: ['mongodb'], label: 'MongoDB', role: 'document-driver' },
  { packages: ['couchdb', 'nano'], label: 'CouchDB', role: 'document-driver' },
  { packages: ['@planetscale/database'], label: 'PlanetScale', role: 'managed-db' },
  { packages: ['@neondatabase/serverless'], label: 'Neon (PostgreSQL)', role: 'managed-db' },
  { packages: ['@libsql/client'], label: 'Turso (libSQL)', role: 'managed-db' },
  { packages: ['@supabase/supabase-js'], label: 'Supabase', role: 'managed-db' },
  { packages: ['firebase', '@firebase/app'], label: 'Firebase / Firestore', role: 'managed-db' },
  { packages: ['cassandra-driver'], label: 'Cassandra', role: 'column-store' },
  { packages: ['dynamoose', '@aws-sdk/client-dynamodb'], label: 'DynamoDB', role: 'managed-nosql' },
];
