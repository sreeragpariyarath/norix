import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  LOCKFILE: 1.0,
};

/**
 * Capability detector for the Bun package manager.
 * Gathers evidence based on bun lockfile presence.
 */
export class BunDetector implements Detector {
  readonly id = 'bun';
  readonly label = 'Bun';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'package-manager';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const lockfiles = ['bun.lockb', 'bun.lock'];
    for (const lockfile of lockfiles) {
      if (context.fileSystem.hasFile(lockfile)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.File, name: lockfile },
          message: `Found Bun lockfile "${lockfile}"`,
          weight: WEIGHTS.LOCKFILE,
        });
      }
    }

    return { evidence };
  }
}
