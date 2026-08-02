/**
 * Topology Rules Configuration
 *
 * Data-driven topology definitions establishing capability relationships
 * (e.g. ORMs connect to Database, Next.js connects to React).
 */

export interface TopologyRule {
  /** Label of the source technology (e.g. "Prisma") */
  readonly technology: string;
  /** Targets to connect to: category IDs or technology labels */
  readonly connectsTo: readonly string[];
}

export const TOPOLOGY_RULES: readonly TopologyRule[] = [
  {
    technology: 'Next.js',
    connectsTo: ['React'],
  },
  {
    technology: 'Nuxt',
    connectsTo: ['Vue.js'],
  },
  {
    technology: 'Prisma',
    connectsTo: ['category:Database'],
  },
  {
    technology: 'Drizzle',
    connectsTo: ['category:Database'],
  },
  {
    technology: 'TypeORM',
    connectsTo: ['category:Database'],
  },
  {
    technology: 'Mongoose',
    connectsTo: ['MongoDB'],
  },
  {
    technology: 'Sequelize',
    connectsTo: ['category:Database'],
  },
  {
    technology: 'Docker',
    connectsTo: ['category:CI/CD'],
  },
];
