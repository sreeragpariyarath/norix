/**
 * Represents the structure of a package.json manifest file.
 */
export interface PackageJsonManifest {
  /** The name of the package/project */
  name?: string;
  /** The current version of the package */
  version?: string;
  /** Production dependencies */
  dependencies?: Record<string, string>;
  /** Development dependencies */
  devDependencies?: Record<string, string>;
  /** Peer dependencies */
  peerDependencies?: Record<string, string>;
  /** Optional dependencies */
  optionalDependencies?: Record<string, string>;
  /** Monorepo workspace configuration patterns */
  workspaces?: string[] | { packages: string[] };
}

/**
 * Interface contract for reading Node.js package configurations and dependency mappings.
 */
export interface NodePackageReader {
  /**
   * Checks if a dependency is declared in any of the dependency configurations.
   *
   * @param name The name of the npm package
   * @returns True if the package is declared, false otherwise
   */
  hasPackage(name: string): boolean;

  /**
   * Resolves the declared version string of a package if it exists.
   *
   * @param name The name of the npm package
   * @returns The version string from package.json, or null if not found
   */
  getPackageVersion(name: string): string | null;

  /**
   * Retrieves the parsed manifest object model of the root package.json file.
   *
   * @returns A promise resolving to the parsed package manifest, or null if missing/corrupt
   */
  getPackageJson(): Promise<PackageJsonManifest | null>;
}
