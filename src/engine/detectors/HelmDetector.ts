import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  HELM_CHART: 1.0,
  HELM_VALUES: 0.5,
};

/**
 * Capability detector for Helm charts.
 * Gathers evidence based on chart file presence.
 */
export class HelmDetector implements Detector {
  readonly id = 'helm';
  readonly label = 'Helm';
  readonly category = CapabilityCategory.Container;
  readonly role = 'package-manager';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('Chart.yaml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'Chart.yaml' },
        message: 'Found Helm Chart configuration "Chart.yaml"',
        weight: WEIGHTS.HELM_CHART,
      });
    }

    if (context.fileSystem.hasFile('values.yaml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'values.yaml' },
        message: 'Found Helm values configuration "values.yaml"',
        weight: WEIGHTS.HELM_VALUES,
      });
    }

    return { evidence };
  }
}
