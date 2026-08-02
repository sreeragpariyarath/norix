import { NodePackageReader, PackageJsonManifest } from './NodePackageReader.js';
import { FileReader } from './FileReader.js';
import { EvidenceCache } from '../../cache/EvidenceCache.js';

/**
 * Concrete implementation of the NodePackageReader interface.
 * Exposes package manifest variables and dependency map indicators.
 */
export class NodePackageReaderImpl implements NodePackageReader {
  /**
   * Creates a NodePackageReaderImpl instance.
   *
   * @param fileReader Abstract file reader instance
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    private fileReader: FileReader,
    private cache: EvidenceCache,
  ) {}

  /**
   * Checks if a dependency is declared in any dependencies map block.
   */
  hasPackage(name: string): boolean {
    const manifest = this.getPackageJsonSync();
    if (!manifest) return false;

    return !!(
      (manifest.dependencies && name in manifest.dependencies) ||
      (manifest.devDependencies && name in manifest.devDependencies) ||
      (manifest.peerDependencies && name in manifest.peerDependencies) ||
      (manifest.optionalDependencies && name in manifest.optionalDependencies)
    );
  }

  /**
   * Resolves the declared package version expression from package.json manifest.
   */
  getPackageVersion(name: string): string | null {
    const manifest = this.getPackageJsonSync();
    if (!manifest) return null;

    return (
      manifest.dependencies?.[name] ??
      manifest.devDependencies?.[name] ??
      manifest.peerDependencies?.[name] ??
      manifest.optionalDependencies?.[name] ??
      null
    );
  }

  /**
   * Retrieves the parsed manifest object model of package.json.
   */
  async getPackageJson(): Promise<PackageJsonManifest | null> {
    return this.getPackageJsonSync();
  }

  /**
   * Synchronously reads and parses package.json, caching the resulting JSON object tree.
   */
  private getPackageJsonSync(): PackageJsonManifest | null {
    return this.cache.getJson('package.json', () => {
      const content = this.fileReader.getFileContentSync('package.json');
      if (!content) return null;
      try {
        return JSON.parse(content) as PackageJsonManifest;
      } catch {
        return null;
      }
    });
  }
}
