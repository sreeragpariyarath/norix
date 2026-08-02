/**
 * Insulates capability detectors from direct filesystem operations.
 * Serves as the access provider for all file search, version, and parsing helpers.
 */
export interface EvidenceContext {
  /** The absolute path to the repository root directory */
  readonly repoRoot: string;
  /** The set of all relative file paths identified in the repository */
  readonly files: Set<string>;
}
