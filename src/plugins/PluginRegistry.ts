import { DetectorConstructor } from '../engine/registry/DetectorFactory.js';

/**
 * Metadata record for a single detector registered by a plugin.
 */
export interface PluginRegistration {
  readonly pluginName: string;
  readonly pluginVersion: string;
  readonly detectorCtor: DetectorConstructor;
}

/**
 * Registry responsible for storing and validating custom plugin detectors.
 */
export class PluginRegistry {
  private registrations: PluginRegistration[] = [];
  private registeredIds = new Set<string>();

  /**
   * Creates a PluginRegistry instance.
   *
   * @param coreDetectors List of core detector instances to seed existing IDs
   */
  constructor(coreDetectors: readonly { id: string }[]) {
    for (const d of coreDetectors) {
      this.registeredIds.add(d.id);
    }
  }

  /**
   * Registers a custom detector constructor for the given plugin.
   * Performs validation and duplicate checks.
   *
   * @param plugin The registering plugin instance
   * @param detectorCtor Constructor of the custom detector class
   */
  registerDetector(
    plugin: { name: string; version: string },
    detectorCtor: DetectorConstructor,
  ): void {
    if (!plugin.name) {
      throw new Error('Plugin validation failed: plugin name is required.');
    }
    if (!plugin.version) {
      throw new Error(`Plugin validation failed for '${plugin.name}': plugin version is required.`);
    }
    if (!detectorCtor) {
      throw new Error(`Plugin '${plugin.name}' registered an invalid detector constructor.`);
    }

    // Instantiate a temporary instance to inspect metadata and id
    const tempInstance = new detectorCtor();
    if (!tempInstance.id) {
      throw new Error(`Plugin '${plugin.name}' registered a detector with no ID.`);
    }
    if (this.registeredIds.has(tempInstance.id)) {
      throw new Error(
        `Duplicate detector ID detected: '${tempInstance.id}' is already registered.`,
      );
    }

    this.registeredIds.add(tempInstance.id);
    this.registrations.push({
      pluginName: plugin.name,
      pluginVersion: plugin.version,
      detectorCtor,
    });
  }

  /**
   * Returns all registration records.
   */
  getRegistrations(): readonly PluginRegistration[] {
    return this.registrations;
  }

  /**
   * Returns all registered detector constructors.
   */
  getDetectorConstructors(): readonly DetectorConstructor[] {
    return this.registrations.map((r) => r.detectorCtor);
  }
}
