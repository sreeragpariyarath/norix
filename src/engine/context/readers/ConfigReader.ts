/**
 * Represents a single service container specification within a docker-compose file.
 */
export interface DockerComposeService {
  /** The container image name (e.g., "postgres:15-alpine") */
  image?: string;
  /** Port mapping bindings list */
  ports?: string[];
  /** Configured environment key-value mappings or variables array */
  environment?: Record<string, string> | string[];
}

/**
 * Represents the parsed structure of a Docker Compose specification.
 */
export interface DockerComposeManifest {
  /** Compose file schema version */
  version?: string;
  /** Active services map */
  services?: Record<string, DockerComposeService>;
}

/**
 * Interface contract for querying specialized technology configs (e.g., Docker, next.config, vite.config).
 */
export interface ConfigReader {
  /**
   * Retrieves the parsed Docker Compose configuration model if present.
   *
   * @returns A promise resolving to the parsed docker-compose manifest, or null if missing/corrupt
   */
  getDockerCompose(): Promise<DockerComposeManifest | null>;

  /**
   * Searches for a pattern within a configuration file by filename.
   *
   * @param filename The configuration file name
   * @param pattern The RegExp match pattern to search
   * @returns A promise resolving to true if pattern matches, false otherwise
   */
  searchInConfig(filename: string, pattern: RegExp): Promise<boolean>;
}
