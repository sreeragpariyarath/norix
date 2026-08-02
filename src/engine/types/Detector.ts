import { CapabilityCategory } from './Capability.js';
import { Evidence } from './Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

/**
 * Contract interface that every technology capability detector must implement.
 */
export interface Detector {
  /** Unique machine-readable identifier for the capability detector */
  readonly id: string;
  /** Human-readable name of the target capability */
  readonly label: string;
  /** The classification category of the capability */
  readonly category: CapabilityCategory;
  /** Sub-role classification within the capability category */
  readonly role: string;
  /** Optional custom match confidence threshold (defaults to 0.3) */
  readonly threshold?: number;

  /**
   * Scans the repository context and compiles a list of registered evidence.
   * Does NOT compute final confidence scores.
   *
   * @param context The filesystem reader context
   * @returns A promise resolving to the list of gathered evidence items
   */
  detect(context: EvidenceContext): Promise<Evidence[]>;
}
