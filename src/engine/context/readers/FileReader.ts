/**
 * Interface contract for raw filesystem level querying and verification.
 */
export interface FileReader {
  /**
   * Verifies the physical presence of a file at the specified relative path.
   *
   * @param path Relative path to the file
   * @returns True if the file exists, false otherwise
   */
  hasFile(path: string): boolean;

  /**
   * Reads raw string content of a file.
   *
   * @param path Relative path to the file
   * @returns A promise resolving to the file content string, or null if missing
   */
  getFileContent(path: string): Promise<string | null>;

  /**
   * Verifies if a file content matches a regular expression pattern.
   *
   * @param path Relative path to the file
   * @param pattern The RegExp match pattern to search
   * @returns A promise resolving to true if the pattern matches, false otherwise
   */
  searchInFile(path: string, pattern: RegExp): Promise<boolean>;
}
