import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  CIRCLECI_CONFIG: 1.0,
};

/**
 * Capability detector for CircleCI CI/CD.
 * Gathers evidence based on config file presence.
 */
export class CircleCIDetector implements Detector {
  readonly id = 'circle-ci';
  readonly label = 'CircleCI';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'ci-cd';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const circleDirs = ['.circleci/config.yml', '.circleci/config.yaml', '.circleci'];
    for (const file of circleDirs) {
      if (context.fileSystem.hasFile(file)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: file },
          message: `Found CircleCI configuration file/folder "${file}"`,
          weight: file.endsWith('.yml') || file.endsWith('.yaml') ? WEIGHTS.CIRCLECI_CONFIG : 0.4,
        });
      }
    }

    return { evidence };
  }
}
