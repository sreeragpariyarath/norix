import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  WORKFLOWS_DIR: 1.0,
};

/**
 * Capability detector for GitHub Actions CI/CD.
 * Gathers evidence based on .github/workflows presence.
 */
export class GitHubActionsDetector implements Detector {
  readonly id = 'github-actions';
  readonly label = 'GitHub Actions';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'ci-cd';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const githubDirs = ['.github/workflows', '.github'];
    for (const dir of githubDirs) {
      if (context.fileSystem.hasFile(dir)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.File, name: dir },
          message: `Found GitHub configurations directory "${dir}"`,
          weight: dir === '.github/workflows' ? WEIGHTS.WORKFLOWS_DIR : 0.4,
        });
      }
    }

    return { evidence };
  }
}
