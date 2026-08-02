export interface CacheStatistics {
  readonly fileHits: number;
  readonly fileMisses: number;
  readonly jsonHits: number;
  readonly jsonMisses: number;
  readonly yamlHits: number;
  readonly yamlMisses: number;
  readonly regexHits: number;
  readonly regexMisses: number;
  readonly contentHits: number;
  readonly contentMisses: number;
}

/**
 * A generic, in-memory caching layer that avoids redundant filesystem operations,
 * file reading, file parsing, and pattern matching inside the detection engine.
 *
 * This class adheres to the Single Responsibility Principle (SRP) by managing
 * cache state and retrieval delegation exclusively, completely independent of the
 * filesystem or workspace details.
 */
export class EvidenceCache {
  private existence = new Map<string, boolean>();
  private contents = new Map<string, Promise<string | null>>();
  private json = new Map<string, unknown>();
  private yaml = new Map<string, unknown>();
  private regexMatches = new Map<string, boolean>();

  private stats = {
    fileHits: 0,
    fileMisses: 0,
    jsonHits: 0,
    jsonMisses: 0,
    yamlHits: 0,
    yamlMisses: 0,
    regexHits: 0,
    regexMisses: 0,
    contentHits: 0,
    contentMisses: 0,
  };

  /**
   * Retrieves a read-only snapshot of the cache execution statistics.
   */
  getStatistics(): CacheStatistics {
    return Object.freeze({ ...this.stats });
  }

  /**
   * Checks if a file exists, caching the result.
   *
   * @param path The relative repository path of the file
   * @param resolver Callback to run if the value is not cached
   * @returns True if the file exists, false otherwise
   */
  hasFile(path: string, resolver: () => boolean): boolean {
    let exists = this.existence.get(path);
    if (exists === undefined) {
      this.stats.fileMisses++;
      exists = resolver();
      this.existence.set(path, exists);
    } else {
      this.stats.fileHits++;
    }
    return exists;
  }

  /**
   * Reads file contents, caching the returned promise.
   * Caching the Promise guarantees that concurrent reads to the same file
   * will reuse the single pending read operation rather than initiating duplicate I/O.
   * If the promise rejects due to a transient error, the entry is automatically
   * evicted from the cache to allow subsequent retries.
   *
   * @param path The relative repository path of the file
   * @param resolver Async callback to load the file content if not cached
   * @returns A promise resolving to the file contents, or null if missing
   */
  getFileContent(path: string, resolver: () => Promise<string | null>): Promise<string | null> {
    let promise = this.contents.get(path);
    if (!promise) {
      this.stats.contentMisses++;
      promise = resolver().catch((error) => {
        this.contents.delete(path);
        throw error;
      });
      this.contents.set(path, promise);
    } else {
      this.stats.contentHits++;
    }
    return promise;
  }

  /**
   * Retrieves and caches a parsed JSON object structure.
   *
   * @param path The relative repository path of the JSON file
   * @param resolver Callback to parse and compile the JSON object if not cached
   * @returns The parsed JSON object model
   */
  getJson<T>(path: string, resolver: () => T): T {
    let data = this.json.get(path);
    if (data === undefined) {
      this.stats.jsonMisses++;
      data = resolver();
      this.json.set(path, data);
    } else {
      this.stats.jsonHits++;
    }
    return data as T;
  }

  /**
   * Retrieves and caches a parsed YAML object structure.
   *
   * @param path The relative repository path of the YAML file
   * @param resolver Callback to parse and compile the YAML object if not cached
   * @returns The parsed YAML object model
   */
  getYaml<T>(path: string, resolver: () => T): T {
    let data = this.yaml.get(path);
    if (data === undefined) {
      this.stats.yamlMisses++;
      data = resolver();
      this.yaml.set(path, data);
    } else {
      this.stats.yamlHits++;
    }
    return data as T;
  }

  /**
   * Searches a file content for a regular expression match, caching the outcome.
   *
   * @param path The relative repository path of the target file
   * @param pattern The RegExp match pattern to evaluate
   * @param resolver Callback to check for matching patterns if not cached
   * @returns True if the pattern matches, false otherwise
   */
  hasRegexMatch(path: string, pattern: RegExp, resolver: () => boolean): boolean {
    const cacheKey = this.createRegexKey(path, pattern);
    let matched = this.regexMatches.get(cacheKey);
    if (matched === undefined) {
      this.stats.regexMisses++;
      matched = resolver();
      this.regexMatches.set(cacheKey, matched);
    } else {
      this.stats.regexHits++;
    }
    return matched;
  }

  /**
   * Generates a unique lookup key for a given file path and regular expression pattern.
   */
  private createRegexKey(path: string, pattern: RegExp): string {
    return `${path}::${pattern.source}::${pattern.flags}`;
  }

  /**
   * Fully resets the internal memory maps, clearing all cached entries.
   * Primarily intended for test teardowns or when scanning multiple repositories sequentially.
   */
  clear(): void {
    this.existence.clear();
    this.contents.clear();
    this.json.clear();
    this.yaml.clear();
    this.regexMatches.clear();
    this.stats = {
      fileHits: 0,
      fileMisses: 0,
      jsonHits: 0,
      jsonMisses: 0,
      yamlHits: 0,
      yamlMisses: 0,
      regexHits: 0,
      regexMisses: 0,
      contentHits: 0,
      contentMisses: 0,
    };
  }
}
