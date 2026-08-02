import { AnalysisResult } from '../types.js';

/**
 * Common interface implemented by all Norix output formatting adapters.
 */
export interface OutputFormatter {
  /**
   * Formats the analysis results into a string payload.
   *
   * @param result Collected repository analysis result
   * @returns Formatted string serialization
   */
  format(result: AnalysisResult): string;
}
