/**
 * Interface contract for inspecting environment configuration and variables.
 */
export interface EnvReader {
  /**
   * Retrieves all parsed environment variables from the codebase env manifests (e.g. .env, .env.example).
   *
   * @returns A promise resolving to a record of env keys and their values
   */
  getEnvVars(): Promise<Record<string, string>>;

  /**
   * Checks if a specific environment variable name is configured.
   *
   * @param name The environment variable key name
   * @returns A promise resolving to true if the env variable is present, false otherwise
   */
  hasEnvVar(name: string): Promise<boolean>;
}
