/**
 * Capability Database (CDB)
 *
 * Maps npm package names to semantic capabilities.
 * Each entry declares an array of `packages` — if ANY of those
 * packages are installed, the capability is considered detected.
 *
 * The `role` field is the key to accurate doctor analysis.
 * Two tools with the SAME role are competing alternatives.
 * Two tools with DIFFERENT roles are complementary — no overlap.
 *
 * Examples:
 *   jest (role: test-runner) + supertest (role: http-assertion) → NOT an overlap
 *   jest (role: test-runner) + vitest (role: test-runner)       → IS an overlap
 *   morgan (role: http-middleware) + winston (role: app-logger)  → NOT an overlap
 *   winston (role: app-logger) + pino (role: app-logger)         → IS an overlap
 */

import type { CapabilityCategory } from './types.js';

export interface DbEntry {
  /** Any of these package names will trigger this capability (OR logic) */
  packages: string[];
  /** Human-readable label shown in terminal output */
  label: string;
  /**
   * Sub-type within the capability category.
   * Doctor only flags overlap when two entries share the same role.
   * Use kebab-case. Be specific — this is the single most important field.
   */
  role: string;
}

export type CapabilityDb = Partial<Record<CapabilityCategory, DbEntry[]>>;

export const DB: CapabilityDb = {
  // ── Frameworks ────────────────────────────────────────────────────────────
  // Roles: meta-framework, server-framework, ui-library, api-layer
  framework: [
    { packages: ['next'], label: 'Next.js', role: 'meta-framework' },
    { packages: ['nuxt', 'nuxt3'], label: 'Nuxt', role: 'meta-framework' },
    { packages: ['@remix-run/node', '@remix-run/react', 'remix'], label: 'Remix', role: 'meta-framework' },
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
    { packages: ['graphql', '@apollo/server', 'apollo-server'], label: 'GraphQL / Apollo', role: 'api-layer' },
  ],

  // ── Databases ─────────────────────────────────────────────────────────────
  // Roles: relational-driver, document-driver, managed-db, column-store
  database: [
    { packages: ['pg', 'pg-native', 'postgres'], label: 'PostgreSQL', role: 'relational-driver' },
    { packages: ['mysql', 'mysql2'], label: 'MySQL', role: 'relational-driver' },
    { packages: ['better-sqlite3', 'sqlite3', '@sqlite.org/sqlite-wasm'], label: 'SQLite', role: 'relational-driver' },
    { packages: ['mongodb'], label: 'MongoDB', role: 'document-driver' },
    { packages: ['couchdb', 'nano'], label: 'CouchDB', role: 'document-driver' },
    { packages: ['@planetscale/database'], label: 'PlanetScale', role: 'managed-db' },
    { packages: ['@neondatabase/serverless'], label: 'Neon (PostgreSQL)', role: 'managed-db' },
    { packages: ['@libsql/client'], label: 'Turso (libSQL)', role: 'managed-db' },
    { packages: ['@supabase/supabase-js'], label: 'Supabase', role: 'managed-db' },
    { packages: ['firebase', '@firebase/app'], label: 'Firebase / Firestore', role: 'managed-db' },
    { packages: ['cassandra-driver'], label: 'Cassandra', role: 'column-store' },
    { packages: ['dynamoose', '@aws-sdk/client-dynamodb'], label: 'DynamoDB', role: 'managed-nosql' },
  ],

  // ── ORMs ──────────────────────────────────────────────────────────────────
  // Roles: relational-orm, document-orm, query-builder
  orm: [
    { packages: ['@prisma/client', 'prisma'], label: 'Prisma', role: 'relational-orm' },
    { packages: ['drizzle-orm'], label: 'Drizzle', role: 'relational-orm' },
    { packages: ['typeorm'], label: 'TypeORM', role: 'relational-orm' },
    { packages: ['sequelize', 'sequelize-typescript'], label: 'Sequelize', role: 'relational-orm' },
    { packages: ['@mikro-orm/core'], label: 'MikroORM', role: 'relational-orm' },
    { packages: ['objection'], label: 'Objection.js', role: 'relational-orm' },
    // Mongoose is a document ODM — different role from relational ORMs
    { packages: ['mongoose'], label: 'Mongoose', role: 'document-orm' },
    // Query builders: lower-level than ORMs, often used alongside one
    { packages: ['kysely'], label: 'Kysely', role: 'query-builder' },
    { packages: ['knex'], label: 'Knex.js', role: 'query-builder' },
  ],

  // ── Validation ────────────────────────────────────────────────────────────
  // All validation libraries compete with each other — same role
  validation: [
    { packages: ['zod'], label: 'Zod', role: 'schema-validator' },
    { packages: ['yup'], label: 'Yup', role: 'schema-validator' },
    { packages: ['joi'], label: 'Joi', role: 'schema-validator' },
    { packages: ['valibot'], label: 'Valibot', role: 'schema-validator' },
    { packages: ['class-validator'], label: 'class-validator', role: 'schema-validator' },
    { packages: ['ajv'], label: 'AJV (JSON Schema)', role: 'schema-validator' },
    { packages: ['superstruct'], label: 'Superstruct', role: 'schema-validator' },
    { packages: ['@sinclair/typebox'], label: 'TypeBox', role: 'schema-validator' },
    { packages: ['arktype'], label: 'ArkType', role: 'schema-validator' },
  ],

  // ── Authentication ────────────────────────────────────────────────────────
  // Roles: auth-framework, auth-service, auth-middleware, token-signing, session
  authentication: [
    { packages: ['@auth/core', 'next-auth'], label: 'Auth.js', role: 'auth-framework' },
    { packages: ['better-auth'], label: 'Better Auth', role: 'auth-framework' },
    { packages: ['lucia'], label: 'Lucia', role: 'auth-framework' },
    { packages: ['@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'], label: 'Supabase Auth', role: 'auth-framework' },
    { packages: ['@clerk/nextjs', '@clerk/clerk-sdk-node', '@clerk/backend'], label: 'Clerk', role: 'auth-service' },
    { packages: ['firebase-admin'], label: 'Firebase Auth (Admin)', role: 'auth-service' },
    { packages: ['@workos-inc/node'], label: 'WorkOS', role: 'auth-service' },
    // Passport is middleware — it doesn't replace an auth framework, it plugs into one
    { packages: ['passport'], label: 'Passport.js', role: 'auth-middleware' },
    // JWT utilities — not auth frameworks, just token signing helpers
    { packages: ['jsonwebtoken'], label: 'jsonwebtoken', role: 'token-signing' },
    { packages: ['jose'], label: 'jose (JWT/JWK)', role: 'token-signing' },
    // Session management — distinct from auth frameworks
    { packages: ['iron-session'], label: 'Iron Session', role: 'session-management' },
  ],

  // ── Cache ─────────────────────────────────────────────────────────────────
  // Roles: redis-client, managed-cache, local-cache, memcached-client
  cache: [
    { packages: ['ioredis'], label: 'Redis (ioredis)', role: 'redis-client' },
    { packages: ['redis'], label: 'Redis', role: 'redis-client' },
    { packages: ['@upstash/redis'], label: 'Upstash Redis', role: 'managed-cache' },
    { packages: ['node-cache'], label: 'node-cache', role: 'local-cache' },
    { packages: ['lru-cache'], label: 'LRU Cache', role: 'local-cache' },
    { packages: ['keyv'], label: 'Keyv', role: 'local-cache' },
    { packages: ['memcached'], label: 'Memcached', role: 'memcached-client' },
  ],

  // ── Queue / Jobs ──────────────────────────────────────────────────────────
  // Roles: redis-queue, postgres-queue, document-queue, message-broker,
  //        managed-queue, serverless-queue
  queue: [
    { packages: ['bullmq'], label: 'BullMQ', role: 'redis-queue' },
    { packages: ['bull'], label: 'Bull', role: 'redis-queue' },
    { packages: ['bee-queue'], label: 'Bee Queue', role: 'redis-queue' },
    { packages: ['pg-boss'], label: 'pg-boss', role: 'postgres-queue' },
    { packages: ['agenda'], label: 'Agenda', role: 'document-queue' },
    { packages: ['amqplib'], label: 'RabbitMQ (amqplib)', role: 'message-broker' },
    { packages: ['kafkajs'], label: 'Kafka (KafkaJS)', role: 'message-broker' },
    { packages: ['@aws-sdk/client-sqs'], label: 'AWS SQS', role: 'managed-queue' },
    { packages: ['inngest'], label: 'Inngest', role: 'serverless-queue' },
    { packages: ['trigger.dev', '@trigger.dev/sdk'], label: 'Trigger.dev', role: 'serverless-queue' },
  ],

  // ── Storage ───────────────────────────────────────────────────────────────
  // Roles: object-storage, managed-storage, media-cdn, upload-service
  storage: [
    { packages: ['@aws-sdk/client-s3', 'aws-sdk'], label: 'AWS S3', role: 'object-storage' },
    { packages: ['@google-cloud/storage'], label: 'Google Cloud Storage', role: 'object-storage' },
    { packages: ['@azure/storage-blob'], label: 'Azure Blob Storage', role: 'object-storage' },
    { packages: ['minio'], label: 'MinIO', role: 'object-storage' },
    { packages: ['@supabase/storage-js'], label: 'Supabase Storage', role: 'managed-storage' },
    { packages: ['@vercel/blob'], label: 'Vercel Blob', role: 'managed-storage' },
    { packages: ['cloudinary'], label: 'Cloudinary', role: 'media-cdn' },
    { packages: ['uploadthing'], label: 'UploadThing', role: 'upload-service' },
  ],

  // ── Email ─────────────────────────────────────────────────────────────────
  // Roles: smtp-client, email-api, email-template
  email: [
    // SMTP client — sends raw email via SMTP protocol
    { packages: ['nodemailer'], label: 'Nodemailer', role: 'smtp-client' },
    // Email API services — managed sending via HTTP API
    { packages: ['resend'], label: 'Resend', role: 'email-api' },
    { packages: ['@sendgrid/mail'], label: 'SendGrid', role: 'email-api' },
    { packages: ['postmark'], label: 'Postmark', role: 'email-api' },
    { packages: ['mailersend'], label: 'MailerSend', role: 'email-api' },
    { packages: ['@mailchimp/mailchimp_transactional'], label: 'Mailchimp', role: 'email-api' },
    { packages: ['aws-sdk', '@aws-sdk/client-ses'], label: 'AWS SES', role: 'email-api' },
    // Email templating — used alongside a sending service, not a replacement
    { packages: ['@react-email/components', '@react-email/render'], label: 'React Email', role: 'email-template' },
  ],

  // ── Payments ──────────────────────────────────────────────────────────────
  // Roles: payment-processor, billing-platform
  payments: [
    { packages: ['stripe'], label: 'Stripe', role: 'payment-processor' },
    { packages: ['paypal-rest-sdk', '@paypal/checkout-server-sdk'], label: 'PayPal', role: 'payment-processor' },
    { packages: ['braintree'], label: 'Braintree', role: 'payment-processor' },
    { packages: ['razorpay'], label: 'Razorpay', role: 'payment-processor' },
    // Billing platforms are distinct from payment processors (subscriptions / licensing)
    { packages: ['@lemonsqueezy/lemonsqueezy.js'], label: 'Lemon Squeezy', role: 'billing-platform' },
    { packages: ['paddle-js', '@paddle/paddle-js'], label: 'Paddle', role: 'billing-platform' },
  ],

  // ── Testing ───────────────────────────────────────────────────────────────
  // Roles: test-runner, e2e-testing, browser-automation,
  //        dom-testing, http-assertion, test-ui
  testing: [
    // Test runners — these directly compete with each other
    { packages: ['vitest'], label: 'Vitest', role: 'test-runner' },
    { packages: ['jest', 'ts-jest'], label: 'Jest', role: 'test-runner' },
    { packages: ['mocha'], label: 'Mocha', role: 'test-runner' },
    { packages: ['jasmine'], label: 'Jasmine', role: 'test-runner' },
    // End-to-end testing — complementary to unit test runners
    { packages: ['@playwright/test'], label: 'Playwright', role: 'e2e-testing' },
    { packages: ['cypress'], label: 'Cypress', role: 'e2e-testing' },
    // Browser automation — lower-level than E2E frameworks
    { packages: ['puppeteer'], label: 'Puppeteer', role: 'browser-automation' },
    // DOM testing utilities — used INSIDE a test runner, not a replacement
    { packages: ['@testing-library/react', '@testing-library/vue', '@testing-library/svelte'], label: 'Testing Library', role: 'dom-testing' },
    // HTTP assertion — used INSIDE a test runner to call APIs, not a replacement
    { packages: ['supertest'], label: 'Supertest', role: 'http-assertion' },
    // Vitest UI — a visual interface for Vitest, not a separate runner
    { packages: ['@vitest/ui'], label: 'Vitest UI', role: 'test-ui' },
  ],

  // ── HTTP Clients ──────────────────────────────────────────────────────────
  // All compete directly — same role
  httpClient: [
    { packages: ['axios'], label: 'Axios', role: 'http-client' },
    { packages: ['got'], label: 'Got', role: 'http-client' },
    { packages: ['ky'], label: 'ky', role: 'http-client' },
    { packages: ['node-fetch'], label: 'node-fetch', role: 'http-client' },
    { packages: ['undici'], label: 'undici', role: 'http-client' },
    { packages: ['superagent'], label: 'SuperAgent', role: 'http-client' },
  ],

  // ── Date Utilities ────────────────────────────────────────────────────────
  // All compete directly — same role
  dateUtility: [
    { packages: ['date-fns'], label: 'date-fns', role: 'date-library' },
    { packages: ['dayjs'], label: 'Day.js', role: 'date-library' },
    { packages: ['moment'], label: 'Moment.js', role: 'date-library' },
    { packages: ['luxon'], label: 'Luxon', role: 'date-library' },
    { packages: ['temporal-polyfill', '@js-temporal/polyfill'], label: 'Temporal (polyfill)', role: 'date-library' },
  ],

  // ── Logging ───────────────────────────────────────────────────────────────
  // Roles: app-logger, http-middleware
  // IMPORTANT: morgan and pino-http are HTTP request loggers — they are
  // COMPLEMENTARY to app loggers like winston/pino, not competitors.
  logging: [
    { packages: ['pino', 'pino-http'], label: 'Pino', role: 'app-logger' },
    { packages: ['winston'], label: 'Winston', role: 'app-logger' },
    { packages: ['bunyan'], label: 'Bunyan', role: 'app-logger' },
    { packages: ['consola'], label: 'Consola', role: 'app-logger' },
    { packages: ['signale'], label: 'Signale', role: 'app-logger' },
    { packages: ['loglevel'], label: 'loglevel', role: 'app-logger' },
    // HTTP access loggers — these log incoming HTTP requests, not app events.
    // morgan is to Express what nginx access logs are to nginx.
    { packages: ['morgan'], label: 'Morgan (HTTP)', role: 'http-middleware' },
  ],

  // ── Documentation ─────────────────────────────────────────────────────────
  // Roles: component-docs, api-docs, docs-site
  documentation: [
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
  ],

  // ── Build Tools ───────────────────────────────────────────────────────────
  // Roles: bundler, ts-bundler, monorepo-tool
  build: [
    { packages: ['vite'], label: 'Vite', role: 'bundler' },
    { packages: ['webpack', 'webpack-cli'], label: 'Webpack', role: 'bundler' },
    { packages: ['esbuild'], label: 'esbuild', role: 'bundler' },
    { packages: ['rollup'], label: 'Rollup', role: 'bundler' },
    { packages: ['parcel', 'parcel-bundler'], label: 'Parcel', role: 'bundler' },
    { packages: ['@rspack/core', 'rspack'], label: 'Rspack', role: 'bundler' },
    // tsup wraps esbuild — it's a different abstraction layer, not a direct bundler competitor
    { packages: ['tsup'], label: 'tsup', role: 'ts-bundler' },
    // Monorepo orchestration tools — not bundlers
    { packages: ['turbo'], label: 'Turborepo', role: 'monorepo-tool' },
    { packages: ['nx'], label: 'Nx', role: 'monorepo-tool' },
  ],
};
