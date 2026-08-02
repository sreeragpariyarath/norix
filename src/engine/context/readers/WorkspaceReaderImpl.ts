import { WorkspaceReader, WorkspaceConfigManifest } from './WorkspaceReader.js';
import { FileReader } from './FileReader.js';
import { EvidenceCache } from '../../cache/EvidenceCache.js';

/**
 * Concrete implementation of the WorkspaceReader interface.
 * Resolves workspaces configurations and lockfiles to determine monorepos.
 */
export class WorkspaceReaderImpl implements WorkspaceReader {
  /**
   * Creates a WorkspaceReaderImpl instance.
   *
   * @param fileReader Abstract file reader instance
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    private fileReader: FileReader,
    private cache: EvidenceCache,
  ) {}

  /**
   * Resolves the workspace configurations.
   */
  async getWorkspaceConfig(): Promise<WorkspaceConfigManifest | null> {
    return this.cache.getJson('workspace-config', () => {
      let isMonorepo = false;
      let workspaces: string[] = [];
      let packageManager: WorkspaceConfigManifest['packageManager'] = 'unknown';

      // 1. Detect package manager based on lockfile presence
      if (this.fileReader.hasFile('bun.lockb') || this.fileReader.hasFile('bun.lock')) {
        packageManager = 'bun';
      } else if (this.fileReader.hasFile('pnpm-lock.yaml')) {
        packageManager = 'pnpm';
      } else if (this.fileReader.hasFile('yarn.lock')) {
        packageManager = 'yarn';
      } else if (this.fileReader.hasFile('package-lock.json')) {
        packageManager = 'npm';
      }

      // 2. Try parsing pnpm-workspace.yaml
      if (this.fileReader.hasFile('pnpm-workspace.yaml')) {
        const content = this.fileReader.getFileContentSync('pnpm-workspace.yaml');
        if (content) {
          const parsed = this.parsePnpmWorkspaceYaml(content);
          if (parsed && parsed.length > 0) {
            isMonorepo = true;
            workspaces = parsed;
          }
        }
      }

      // 3. Try parsing package.json workspaces if not resolved yet
      if (workspaces.length === 0 && this.fileReader.hasFile('package.json')) {
        const packageJsonContent = this.fileReader.getFileContentSync('package.json');
        if (packageJsonContent) {
          try {
            const pkg = JSON.parse(packageJsonContent);
            if (pkg.workspaces) {
              isMonorepo = true;
              workspaces = Array.isArray(pkg.workspaces)
                ? pkg.workspaces
                : pkg.workspaces.packages || [];
            }
          } catch {
            // Ignore corrupted package.json
          }
        }
      }

      return {
        isMonorepo,
        workspaces,
        packageManager,
      };
    });
  }

  /**
   * Parses pnpm-workspace.yaml synchronously, caching the resolved string array.
   */
  private parsePnpmWorkspaceYaml(content: string): string[] | null {
    return this.cache.getYaml('pnpm-workspace.yaml', () => {
      const patterns: string[] = [];
      let inPackages = false;

      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();

        if (line === 'packages:') {
          inPackages = true;
          continue;
        }

        if (inPackages) {
          if (line.startsWith('-')) {
            const pattern = line
              .slice(1)
              .trim()
              .replace(/^['"]|['"]$/g, '');
            if (pattern) patterns.push(pattern);
          } else if (line.length > 0 && !line.startsWith('#')) {
            inPackages = false;
          }
        }
      }

      return patterns.length > 0 ? patterns : null;
    });
  }
}
