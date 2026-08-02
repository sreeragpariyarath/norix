import { PluginRegistry } from './PluginRegistry.js';

/**
 * Interface contract that every third-party Norix plugin must implement.
 */
export interface NorixPlugin {
  /** Unique name of the plugin */
  readonly name: string;
  /** Semantic version of the plugin */
  readonly version: string;
  /** Semver range of compatible Norix CLI version (e.g. "^1.0.0" or "^2.0.0") */
  readonly norix: string;
  /** Optional summary explanation of what the plugin detects */
  readonly description?: string;
  /** Optional URL link to the plugin's source repository or documentation */
  readonly homepage?: string;

  /**
   * Invoked during plugin initialization. Used to register custom detector constructors.
   *
   * @param registry Target registry to register custom detectors
   */
  register(registry: PluginRegistry): void | Promise<void>;
}
