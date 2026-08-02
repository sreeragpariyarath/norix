import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  GITLAB_CI: 1.0,
};

/**
 * Capability detector for GitLab CI/CD.
 * Gathers evidence based on .gitlab-ci.yml presence.
 */
export class GitLabCIDetector implements Detector {
  readonly id = 'gitlab-ci';
  readonly label = 'GitLab CI';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'ci-cd';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('.gitlab-ci.yml')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: '.gitlab-ci.yml' },
        message: 'Found GitLab CI configuration file ".gitlab-ci.yml"',
        weight: WEIGHTS.GITLAB_CI,
      });
    }

    return { evidence };
  }
}
