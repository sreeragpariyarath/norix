import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  LOCKFILE: 1.0,
};

/**
 * Capability detector for the npm package manager.
 * Gathers evidence based on package-lock.json presence.
 */
export class NpmDetector implements Detector {
  readonly id = 'npm';
  readonly label = 'npm';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'package-manager';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('package-lock.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: 'package-lock.json' },
        message: 'Found "package-lock.json" lockfile',
        weight: WEIGHTS.LOCKFILE,
      });
    }

    return { evidence };
  }
}
