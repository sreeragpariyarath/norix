import { NodePackageReader } from './readers/NodePackageReader.js';
import { WorkspaceReader } from './readers/WorkspaceReader.js';
import { EnvReader } from './readers/EnvReader.js';
import { ConfigReader } from './readers/ConfigReader.js';
import { FileReader } from './readers/FileReader.js';

/**
 * Insulates capability detectors from direct filesystem operations.
 * Serves as the consolidated provider for all domain-specific information readers.
 */
export interface EvidenceContext {
  /** The absolute path to the repository root directory */
  readonly repoRoot: string;

  /** Node-specific package manifest and dependency reader */
  readonly node: NodePackageReader;
  /** Reader contract for querying monorepo structures and workspaces configuration */
  readonly workspace: WorkspaceReader;
  /** Reader contract for querying configured environment variables */
  readonly env: EnvReader;
  /** Reader contract for querying technology configurations and containers */
  readonly configs: ConfigReader;
  /** Reader contract for executing raw file lookups, reads, and pattern matching */
  readonly fileSystem: FileReader;
}
