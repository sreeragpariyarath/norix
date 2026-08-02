/**
 * Represents the parsed monorepo workspace metadata.
 */
export interface WorkspaceConfigManifest {
  /** True if the repository is configured as a monorepo */
  isMonorepo: boolean;
  /** Glob patterns matching workspace package paths */
  workspaces: string[];
  /** Resolved package manager utilized in the repository */
  packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' | 'unknown';
}

/**
 * Interface contract for reading monorepo workspace structure and package managers.
 */
export interface WorkspaceReader {
  /**
   * Resolves the workspace configurations.
   *
   * @returns A promise resolving to the monorepo workspace metadata, or null if single-package
   */
  getWorkspaceConfig(): Promise<WorkspaceConfigManifest | null>;
}
