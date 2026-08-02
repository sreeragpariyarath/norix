import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  LOCKFILE: 1.0,
};

/**
 * Capability detector for the Yarn package manager.
 * Gathers evidence based on yarn.lock presence.
 */
export class YarnDetector implements Detector {
  readonly id = 'yarn';
  readonly label = 'Yarn';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'package-manager';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('yarn.lock')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: 'yarn.lock' },
        message: 'Found "yarn.lock" lockfile',
        weight: WEIGHTS.LOCKFILE,
      });
    }

    return { evidence };
  }
}
