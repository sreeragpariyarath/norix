// ─── Package JSON shape ─────────────────────────────────────────────────────────

export interface PackageJsonFile {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  workspaces?: string[] | { packages: string[] };
}

// ─── Capability Categories ────────────────────────────────────────────────────

export type CapabilityCategory =
  | 'framework'
  | 'packageManager'
  | 'database'
  | 'orm'
  | 'validation'
  | 'authentication'
  | 'cache'
  | 'queue'
  | 'storage'
  | 'email'
  | 'payments'
  | 'testing'
  | 'httpClient'
  | 'dateUtility'
  | 'logging'
  | 'documentation'
  | 'build';

/** Human-readable label for each capability category, used in terminal output */
export const CATEGORY_LABELS: Record<CapabilityCategory, string> = {
  framework: 'Framework',
  packageManager: 'Package Mgr',
  database: 'Database',
  orm: 'ORM',
  validation: 'Validation',
  authentication: 'Auth',
  cache: 'Cache',
  queue: 'Queue',
  storage: 'Storage',
  email: 'Email',
  payments: 'Payments',
  testing: 'Testing',
  httpClient: 'HTTP Client',
  dateUtility: 'Date',
  logging: 'Logging',
  documentation: 'Docs',
  build: 'Build',
};

/** Display order for capability categories in terminal output */
export const CATEGORY_ORDER: CapabilityCategory[] = [
  'framework',
  'packageManager',
  'database',
  'orm',
  'validation',
  'authentication',
  'cache',
  'queue',
  'storage',
  'email',
  'payments',
  'testing',
  'httpClient',
  'dateUtility',
  'logging',
  'documentation',
  'build',
];

// ─── Output Types ─────────────────────────────────────────────────────────────

/** A detected capability with the packages that triggered it */
export interface CapabilityMatch {
  label: string;
  matchedPackages: string[];
  /**
   * Sub-type within the capability category (from the DB entry).
   * Doctor groups matches by role to find true overlaps.
   * Two matches with the same role = competing tools.
   * Two matches with different roles = complementary tools.
   */
  role: string;
}

/** Raw output from the file system scanner */
export interface ScanResult {
  repoName: string;
  repoRoot: string;
  isMonorepo: boolean;
  workspaceNames: string[];
  /** All installed packages (deps + devDeps) across all workspaces */
  allPackages: Map<string, { version: string; isDev: boolean }>;
  language: string;
  packageManager: string;
  packageJsonCount: number;
  /** Scan duration in milliseconds */
  duration: number;
}

/** Final output of the analyze command */
export interface AnalysisResult extends ScanResult {
  capabilities: Partial<Record<CapabilityCategory, CapabilityMatch[]>>;
}

// ─── Doctor Types ─────────────────────────────────────────────────────────────

export type FindingSeverity = 'warning' | 'info';

export interface DoctorEvidence {
  package: string;
}

export interface DoctorFinding {
  id: string;
  title: string;
  severity: FindingSeverity;
  category: CapabilityCategory;
  evidence: DoctorEvidence[];
  reasoning: string;
}

export interface DoctorResult {
  findings: DoctorFinding[];
  summary: {
    total: number;
    warning: number;
    info: number;
  };
  duration: number;
}

// ─── Report Types ─────────────────────────────────────────────────────────────

export type ReportFormat = 'markdown' | 'json' | 'all';

export interface ReportOptions {
  format: ReportFormat;
  outputDir: string;
  includeDoctor: boolean;
}

export interface GeneratedReport {
  markdownPath?: string;
  jsonPath?: string;
}
