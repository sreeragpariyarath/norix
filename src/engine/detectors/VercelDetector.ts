import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  VERCEL_CONFIG: 1.0,
  VERCEL_DIR: 0.5,
};

/**
 * Capability detector for the Vercel deployment platform.
 * Gathers evidence based on config and metadata file presence.
 */
export class VercelDetector implements Detector {
  readonly id = 'vercel';
  readonly label = 'Vercel';
  readonly category = CapabilityCategory.Cloud;
  readonly role = 'deployment-platform';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('vercel.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'vercel.json' },
        message: 'Found Vercel configuration file "vercel.json"',
        weight: WEIGHTS.VERCEL_CONFIG,
      });
    }

    if (context.fileSystem.hasFile('.vercel')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: '.vercel' },
        message: 'Found Vercel local cache directory ".vercel/"',
        weight: WEIGHTS.VERCEL_DIR,
      });
    }

    return { evidence };
  }
}
