import { Detector } from '../types/Detector.js';
import { DetectionResult } from '../types/DetectionResult.js';
import { EvidenceContext } from '../context/EvidenceContext.js';
import { ConfidenceEngine } from '../scoring/ConfidenceEngine.js';

/**
 * Core registry that manages sequential detector execution and confidence score compilation.
 */
export class DetectorRegistry {
  private detectors: Detector[] = [];

  /**
   * Adds detector instances to the registry execution pipeline.
   *
   * @param detectors List of detector instances to execute
   */
  add(detectors: Detector[]): void {
    this.detectors.push(...detectors);
  }

  /**
   * Executes all registered detectors sequentially, compiling their findings.
   *
   * @param context Abstract domain readers context
   * @returns A promise resolving to the collection of capability detection results
   */
  async execute(context: EvidenceContext): Promise<DetectionResult[]> {
    const results: DetectionResult[] = [];

    for (const detector of this.detectors) {
      try {
        const evidence = await detector.detect(context);
        const confidence = ConfidenceEngine.calculate(evidence);

        results.push({
          detectorId: detector.id,
          capability: detector.label,
          category: detector.category,
          matched: confidence >= 0.5,
          confidence,
          evidence,
        });
      } catch {
        // Safe fallback in case of individual detector exception
        results.push({
          detectorId: detector.id,
          capability: detector.label,
          category: detector.category,
          matched: false,
          confidence: 0.0,
          evidence: [],
        });
      }
    }

    return results;
  }

  /**
   * Resets the execution pipeline registry.
   */
  clear(): void {
    this.detectors = [];
  }
}
