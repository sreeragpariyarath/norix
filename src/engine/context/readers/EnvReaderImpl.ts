import { EnvReader } from './EnvReader.js';
import { FileReader } from './FileReader.js';
import { EvidenceCache } from '../../cache/EvidenceCache.js';

/**
 * Concrete implementation of the EnvReader interface.
 * Parses variables from dotenv configuration files.
 */
export class EnvReaderImpl implements EnvReader {
  /**
   * Creates an EnvReaderImpl instance.
   *
   * @param fileReader Abstract file reader instance
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    private fileReader: FileReader,
    private cache: EvidenceCache,
  ) {}

  /**
   * Retrieves all parsed environment variables.
   */
  async getEnvVars(): Promise<Record<string, string>> {
    return this.cache.getJson('env-vars', () => {
      const vars: Record<string, string> = {};

      const envFiles = ['.env', '.env.example'];
      for (const envFile of envFiles) {
        if (this.fileReader.hasFile(envFile)) {
          const content = this.fileReader.getFileContentSync(envFile);
          if (content) {
            this.parseEnvFile(content, vars);
          }
        }
      }

      return vars;
    });
  }

  /**
   * Checks if a specific environment variable name exists.
   */
  async hasEnvVar(name: string): Promise<boolean> {
    const vars = await this.getEnvVars();
    return name in vars;
  }

  /**
   * Parses environment content lines.
   */
  private parseEnvFile(content: string, vars: Record<string, string>): void {
    const lines = content.split(/\r?\n/);
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith('#') || line === '') continue;

      const equalIdx = line.indexOf('=');
      if (equalIdx > 0) {
        const key = line.slice(0, equalIdx).trim();
        const value = line
          .slice(equalIdx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        vars[key] = value;
      }
    }
  }
}
