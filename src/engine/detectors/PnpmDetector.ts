import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  LOCKFILE: 1.0,
  WORKSPACE: 0.5,
};

/**
 * Capability detector for the pnpm package manager.
 * Gathers evidence based on lockfile and workspace config presence.
 */
export class PnpmDetector implements Detector {
  readonly id = 'pnpm';
  readonly label = 'pnpm';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'package-manager';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('pnpm-lock.yaml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: 'pnpm-lock.yaml' },
        message: 'Found "pnpm-lock.yaml" lockfile',
        weight: WEIGHTS.LOCKFILE,
      });
    }

    if (context.fileSystem.hasFile('pnpm-workspace.yaml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'pnpm-workspace.yaml' },
        message: 'Found "pnpm-workspace.yaml" workspace configuration',
        weight: WEIGHTS.WORKSPACE,
      });
    }

    return { evidence };
  }
}
