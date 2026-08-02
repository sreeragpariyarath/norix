import { CapabilityCategory } from './Capability.js';
import { Evidence } from './Evidence.js';

/**
 * Represents the final aggregated results of executing a capability detector,
 * compiled with a cumulative confidence score calculated by the ConfidenceEngine.
 */
export interface DetectionResult {
  /** Unique machine-readable identifier of the executed capability detector */
  detectorId: string;
  /** Human-readable label of the target technology capability (e.g. "Next.js") */
  capability: string;
  /** The capability classification category */
  category: CapabilityCategory;
  /** True if the capability was confidently matched in the codebase */
  matched: boolean;
  /** Calculated cumulative confidence score (value between 0.0 and 1.0) */
  confidence: number;
  /** Optional resolved version of the matched capability (e.g., "14.2.3") */
  version?: string;
  /** List of all evidence items compiled during detector execution */
  evidence: Evidence[];
  /** Optional error diagnostic message if the execution failed */
  error?: string;
}
