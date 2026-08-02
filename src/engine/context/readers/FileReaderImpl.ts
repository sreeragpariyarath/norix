import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { FileReader } from './FileReader.js';
import { EvidenceCache } from '../../cache/EvidenceCache.js';

/**
 * Concrete implementation of the FileReader interface.
 * This is the ONLY component in the engine permitted to access Node.js filesystem APIs.
 */
export class FileReaderImpl implements FileReader {
  private syncContents = new Map<string, string | null>();

  /**
   * Creates a FileReaderImpl instance.
   *
   * @param repoRoot Absolute path of the repository root
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    private repoRoot: string,
    private cache: EvidenceCache,
  ) {}

  /**
   * Verifies if a file exists, caching the result.
   */
  hasFile(relativePath: string): boolean {
    const fullPath = join(this.repoRoot, relativePath);
    return this.cache.hasFile(relativePath, () => existsSync(fullPath));
  }

  /**
   * Reads raw string content of a file asynchronously, caching the result promise.
   */
  async getFileContent(relativePath: string): Promise<string | null> {
    if (this.syncContents.has(relativePath)) {
      return this.syncContents.get(relativePath)!;
    }

    const fullPath = join(this.repoRoot, relativePath);
    return this.cache.getFileContent(relativePath, async () => {
      if (!this.hasFile(relativePath)) return null;
      try {
        const content = readFileSync(fullPath, 'utf-8');
        this.syncContents.set(relativePath, content);
        return content;
      } catch {
        this.syncContents.set(relativePath, null);
        return null;
      }
    });
  }

  /**
   * Reads raw string content of a file synchronously, caching the resolved string.
   */
  getFileContentSync(relativePath: string): string | null {
    if (this.syncContents.has(relativePath)) {
      return this.syncContents.get(relativePath)!;
    }

    if (!this.hasFile(relativePath)) {
      this.syncContents.set(relativePath, null);
      return null;
    }

    const fullPath = join(this.repoRoot, relativePath);
    try {
      const content = readFileSync(fullPath, 'utf-8');
      this.syncContents.set(relativePath, content);
      return content;
    } catch {
      this.syncContents.set(relativePath, null);
      return null;
    }
  }

  /**
   * Verifies if a file matches a regular expression pattern, caching the outcome.
   */
  async searchInFile(relativePath: string, pattern: RegExp): Promise<boolean> {
    const content = await this.getFileContent(relativePath);
    if (!content) return false;

    return this.cache.hasRegexMatch(relativePath, pattern, () => {
      return pattern.test(content);
    });
  }
}
