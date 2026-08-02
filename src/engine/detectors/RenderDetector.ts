import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  RENDER_CONFIG: 1.0,
};

/**
 * Capability detector for the Render deployment platform.
 * Gathers evidence based on render.yaml or render.yml presence.
 */
export class RenderDetector implements Detector {
  readonly id = 'render';
  readonly label = 'Render';
  readonly category = CapabilityCategory.Cloud;
  readonly role = 'deployment-platform';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const configFiles = ['render.yaml', 'render.yml'];
    for (const file of configFiles) {
      if (context.fileSystem.hasFile(file)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: file },
          message: `Found Render configuration file "${file}"`,
          weight: WEIGHTS.RENDER_CONFIG,
        });
      }
    }

    return { evidence };
  }
}
