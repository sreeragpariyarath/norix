/**
 * Classifies the method of evidence gathering.
 */
export enum EvidenceType {
  /** The evidence is a dependency mapping from a package manifest */
  Dependency = 'dependency',
  /** The evidence is the physical presence of a specific file */
  FilePresence = 'file_presence',
  /** The evidence is matching string/regex content found in a file */
  FileContent = 'file_content',
  /** The evidence is a parsed property inside a configuration manifest */
  ConfigProperty = 'config_property',
  /** The evidence is an environment variable configuration name */
  EnvVar = 'env_var',
}

/**
 * Classifies the type of codebase configuration or asset serving as the evidence source.
 */
export enum EvidenceSourceType {
  /** Project manifest files (e.g. package.json, Cargo.toml) */
  Manifest = 'manifest',
  /** Framework or tool configuration files (e.g. next.config.ts) */
  Config = 'config',
  /** Environment configuration and variables (e.g. .env, .env.example) */
  Environment = 'environment',
  /** CI/CD pipeline and automation workflow configs (e.g. ci.yml) */
  Workflow = 'workflow',
  /** Package manager dependency lockfiles (e.g. pnpm-lock.yaml) */
  Lockfile = 'lockfile',
  /** Source code statements and imports (e.g. import "x" or require("y")) */
  Import = 'import',
  /** Physical repository asset files or folders */
  File = 'file',
}

/**
 * Holds detailed coordinates for the source of an evidence item.
 */
export interface EvidenceSource {
  /** The category classification of the evidence source */
  type: EvidenceSourceType;
  /** The name of the source (e.g., "package.json", "Dockerfile") */
  name: string;
}

/**
 * Represents a single piece of validation telemetry compiled by a capability detector.
 */
export interface Evidence {
  /** The classification category of the evidence */
  type: EvidenceType;
  /** The specific file or variable coordinate source */
  source: EvidenceSource;
  /** Optional file path relative to repository root where the evidence was located */
  file?: string;
  /** Optional 1-indexed line number where the match was identified */
  line?: number;
  /** Human-readable explanation of why this evidence was registered */
  message: string;
  /**
   * The weight of this evidence contribution (value between 0.0 and 1.0).
   * Used by the ConfidenceEngine to compute the cumulative capability probability.
   */
  weight: number;
}
