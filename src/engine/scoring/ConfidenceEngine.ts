import { Evidence } from '../types/Evidence.js';

/**
 * Calculates aggregated confidence scores from individual evidence contributions.
 */
export class ConfidenceEngine {
  /**
   * Calculates the cumulative confidence score from a list of evidence weights
   * using the bounded probability formula: C = 1 - product(1 - weight).
   * Capped between 0.0 and 1.0 and rounded to two decimal places.
   *
   * @param evidence List of evidence items compiled by the detector
   * @returns Bounded confidence score between 0.0 and 1.0
   */
  static calculate(evidence: Evidence[]): number {
    if (evidence.length === 0) {
      return 0.0;
    }

    // Multiply (1 - weight) for all evidence weights
    let product = 1.0;
    for (const item of evidence) {
      // Clamp weight contribution between 0.0 and 1.0 to prevent scaling issues
      const weight = Math.max(0.0, Math.min(1.0, item.weight));
      product *= 1.0 - weight;
    }

    const cumulative = 1.0 - product;

    // Clamp cumulative between 0.0 and 1.0 and round to 2 decimal places
    const clamped = Math.max(0.0, Math.min(1.0, cumulative));
    return Math.round(clamped * 100) / 100;
  }
}
