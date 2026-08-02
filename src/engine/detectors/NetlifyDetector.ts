import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  NETLIFY_CONFIG: 1.0,
};

/**
 * Capability detector for the Netlify deployment platform.
 * Gathers evidence based on netlify.toml presence.
 */
export class NetlifyDetector implements Detector {
  readonly id = 'netlify';
  readonly label = 'Netlify';
  readonly category = CapabilityCategory.Cloud;
  readonly role = 'deployment-platform';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('netlify.toml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'netlify.toml' },
        message: 'Found Netlify configuration file "netlify.toml"',
        weight: WEIGHTS.NETLIFY_CONFIG,
      });
    }

    return { evidence };
  }
}
