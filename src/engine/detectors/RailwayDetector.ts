import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  RAILWAY_CONFIG: 1.0,
};

/**
 * Capability detector for the Railway deployment platform.
 * Gathers evidence based on railway.json presence.
 */
export class RailwayDetector implements Detector {
  readonly id = 'railway';
  readonly label = 'Railway';
  readonly category = CapabilityCategory.Cloud;
  readonly role = 'deployment-platform';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('railway.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'railway.json' },
        message: 'Found Railway configuration file "railway.json"',
        weight: WEIGHTS.RAILWAY_CONFIG,
      });
    }

    return { evidence };
  }
}
