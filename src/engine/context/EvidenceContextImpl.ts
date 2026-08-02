import { EvidenceContext } from './EvidenceContext.js';
import { NodePackageReader } from './readers/NodePackageReader.js';
import { WorkspaceReader } from './readers/WorkspaceReader.js';
import { EnvReader } from './readers/EnvReader.js';
import { ConfigReader } from './readers/ConfigReader.js';
import { FileReader } from './readers/FileReader.js';
import { EvidenceCache } from '../cache/EvidenceCache.js';
import { FileReaderImpl } from './readers/FileReaderImpl.js';
import { NodePackageReaderImpl } from './readers/NodePackageReaderImpl.js';
import { WorkspaceReaderImpl } from './readers/WorkspaceReaderImpl.js';
import { EnvReaderImpl } from './readers/EnvReaderImpl.js';
import { ConfigReaderImpl } from './readers/ConfigReaderImpl.js';

/**
 * Concrete implementation of the EvidenceContext interface.
 * Composes all domain readers and exposes them under a unified interface facade.
 */
export class EvidenceContextImpl implements EvidenceContext {
  readonly node: NodePackageReader;
  readonly workspace: WorkspaceReader;
  readonly env: EnvReader;
  readonly configs: ConfigReader;
  readonly fileSystem: FileReader;

  /**
   * Creates an EvidenceContextImpl instance.
   *
   * @param repoRoot Absolute path of the repository root
   * @param files Set of all relative file paths identified in the repository
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    readonly repoRoot: string,
    readonly files: Set<string>,
    cache: EvidenceCache,
  ) {
    this.fileSystem = new FileReaderImpl(repoRoot, cache);
    this.node = new NodePackageReaderImpl(this.fileSystem, cache);
    this.workspace = new WorkspaceReaderImpl(this.fileSystem, cache);
    this.env = new EnvReaderImpl(this.fileSystem, cache);
    this.configs = new ConfigReaderImpl(this.fileSystem, cache);
  }
}
