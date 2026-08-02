import { Detector } from '../types/Detector.js';

export type DetectorConstructor = new () => Detector;

/**
 * Factory class responsible for registering detector constructors and creating instances.
 * Instanced design avoids cross-test state leakages.
 */
export class DetectorFactory {
  private registry = new Map<string, DetectorConstructor>();

  /**
   * Registers a new capability detector constructor in the factory map.
   * Throws an error if the detector ID is already registered to prevent duplicates.
   *
   * @param id Unique identifier of the detector
   * @param ctor Constructor of the detector class
   */
  register(id: string, ctor: DetectorConstructor): void {
    if (this.registry.has(id)) {
      throw new Error(`Detector with ID '${id}' is already registered.`);
    }
    this.registry.set(id, ctor);
  }

  /**
   * Creates a new instance of a registered detector by its ID.
   * Throws an error if the detector ID is not found.
   *
   * @param id Unique identifier of the target detector
   * @returns A new instance of the registered detector
   */
  create(id: string): Detector {
    const Ctor = this.registry.get(id);
    if (!Ctor) {
      throw new Error(`Detector with ID '${id}' is not registered.`);
    }
    return new Ctor();
  }

  /**
   * Checks if a detector ID is registered.
   *
   * @param id Unique identifier of the target detector
   * @returns True if registered, false otherwise
   */
  has(id: string): boolean {
    return this.registry.has(id);
  }

  /**
   * Instantiates all registered detectors.
   *
   * @returns A list of new detector instances
   */
  createAll(): Detector[] {
    return Array.from(this.registry.keys()).map((id) => this.create(id));
  }

  /**
   * Clears all registered constructor entries.
   */
  clear(): void {
    this.registry.clear();
  }
}
