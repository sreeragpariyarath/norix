import { ConfigReader, DockerComposeManifest, DockerComposeService } from './ConfigReader.js';
import { FileReader } from './FileReader.js';
import { EvidenceCache } from '../../cache/EvidenceCache.js';

/**
 * Concrete implementation of the ConfigReader interface.
 * Parses technology configurations, currently supporting Docker Compose specifications.
 */
export class ConfigReaderImpl implements ConfigReader {
  /**
   * Creates a ConfigReaderImpl instance.
   *
   * @param fileReader Abstract file reader instance
   * @param cache Shared EvidenceCache instance
   */
  constructor(
    private fileReader: FileReader,
    private cache: EvidenceCache,
  ) {}

  /**
   * Retrieves the parsed Docker Compose manifest config if present.
   */
  async getDockerCompose(): Promise<DockerComposeManifest | null> {
    const filenames = ['docker-compose.yml', 'docker-compose.yaml'];
    const composeFile = filenames.find((f) => this.fileReader.hasFile(f));
    if (!composeFile) return null;

    return this.cache.getYaml(composeFile, () => {
      const content = this.fileReader.getFileContentSync(composeFile);
      if (!content) return null;
      return this.parseDockerCompose(content);
    });
  }

  /**
   * Searches for a pattern inside a configuration file content.
   */
  async searchInConfig(filename: string, pattern: RegExp): Promise<boolean> {
    if (!this.fileReader.hasFile(filename)) return false;
    return this.fileReader.searchInFile(filename, pattern);
  }

  /**
   * Parses docker compose config lines.
   */
  private parseDockerCompose(content: string): DockerComposeManifest | null {
    try {
      const lines = content.split(/\r?\n/);
      const services: Record<string, DockerComposeService> = {};
      let currentService: string | null = null;
      let currentKey: 'ports' | 'environment' | null = null;
      let inServices = false;
      let version: string | undefined;

      for (const rawLine of lines) {
        if (rawLine.trim().startsWith('#') || rawLine.trim() === '') continue;

        const indent = rawLine.match(/^\s*/)?.[0].length ?? 0;
        const line = rawLine.trim();

        if (indent === 0) {
          inServices = false;
          currentService = null;
          currentKey = null;

          if (line.startsWith('version:')) {
            version = line
              .split(':')[1]
              ?.trim()
              .replace(/^['"]|['"]$/g, '');
          } else if (line.startsWith('services:')) {
            inServices = true;
          }
          continue;
        }

        if (inServices) {
          if (indent === 2 && line.endsWith(':')) {
            const serviceName = line.slice(0, -1).trim();
            currentService = serviceName;
            services[currentService] = {};
            currentKey = null;
            continue;
          }

          if (currentService && indent > 2) {
            const service = services[currentService];
            if (!service) continue;

            if (line.includes(':')) {
              const colonIdx = line.indexOf(':');
              const key = line.slice(0, colonIdx).trim();
              const value = line.slice(colonIdx + 1).trim();

              if (key === 'image') {
                service.image = value.replace(/^['"]|['"]$/g, '');
                currentKey = null;
              } else if (key === 'ports') {
                service.ports = [];
                currentKey = 'ports';
                if (value.startsWith('[') && value.endsWith(']')) {
                  service.ports = JSON.parse(value.replace(/'/g, '"'));
                  currentKey = null;
                }
              } else if (key === 'environment') {
                service.environment = {};
                currentKey = 'environment';
                if (value.startsWith('{') && value.endsWith('}')) {
                  service.environment = JSON.parse(value.replace(/'/g, '"'));
                  currentKey = null;
                }
              } else {
                currentKey = null;
              }
            } else if (line.startsWith('-') && currentKey) {
              const item = line
                .slice(1)
                .trim()
                .replace(/^['"]|['"]$/g, '');

              if (currentKey === 'ports' && Array.isArray(service.ports)) {
                service.ports.push(item);
              } else if (currentKey === 'environment') {
                if (Array.isArray(service.environment)) {
                  service.environment.push(item);
                } else if (service.environment && typeof service.environment === 'object') {
                  const environmentMap = service.environment as Record<string, string>;
                  const equalIdx = item.indexOf('=');
                  if (equalIdx > 0) {
                    const k = item.slice(0, equalIdx).trim();
                    const v = item
                      .slice(equalIdx + 1)
                      .trim()
                      .replace(/^['"]|['"]$/g, '');
                    environmentMap[k] = v;
                  } else {
                    environmentMap[item] = '';
                  }
                } else {
                  service.environment = [item];
                }
              }
            }
          }
        }
      }

      const manifest: DockerComposeManifest = { services };
      if (version !== undefined) {
        manifest.version = version;
      }
      return manifest;
    } catch {
      return null;
    }
  }
}
