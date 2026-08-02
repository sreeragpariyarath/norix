/**
 * Represents the broad classification categories for codebase capabilities.
 * Every detected technology belongs to exactly one capability category.
 */
export enum CapabilityCategory {
  /** Application frameworks and meta-frameworks (e.g. Next.js, Express) */
  Framework = 'framework',
  /** Data storage systems (e.g. PostgreSQL, MongoDB) */
  Database = 'database',
  /** Object-Relational Mappers and Query Builders (e.g. Prisma, Drizzle) */
  ORM = 'orm',
  /** In-memory cache managers (e.g. Redis, Memcached) */
  Cache = 'cache',
  /** Task queue and message brokers (e.g. BullMQ, RabbitMQ) */
  Queue = 'queue',
  /** Asset and object storage platforms (e.g. AWS S3, Cloudinary) */
  Storage = 'storage',
  /** Artificial Intelligence, LLM integrations, and frameworks (e.g. OpenAI, LangChain) */
  AI = 'ai',
  /** Infrastructure cloud providers (e.g. AWS, GCP, Azure) */
  Cloud = 'cloud',
  /** Containerization and orchestration tools (e.g. Docker, Kubernetes) */
  Container = 'container',
  /** Primary programming languages used in the repository (e.g. TypeScript) */
  Language = 'language',
  /** Test runners and testing utilities (e.g. Vitest, Playwright) */
  Testing = 'testing',
  /** Bundlers, compilers, and workspace tools (e.g. Vite, Turborepo) */
  BuildTool = 'build',
  /** Style sheet frameworks and layout tools (e.g. Tailwind CSS) */
  CSS = 'css',
  /** Identity, auth, and session providers (e.g. Auth.js, Clerk) */
  Authentication = 'authentication',
  /** Transaction and billing gateways (e.g. Stripe, PayPal) */
  Payment = 'payments',
  /** Application monitoring and logging libraries (e.g. Pino, Winston) */
  Monitoring = 'monitoring',
  /** User behavior and product analytics (e.g. PostHog, Google Analytics) */
  Analytics = 'analytics',
}
