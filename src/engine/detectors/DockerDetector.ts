import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  DOCKERFILE: 1.0,
  DOCKERIGNORE: 0.5,
};

/**
 * Capability detector for Docker containerization.
 * Gathers evidence based on Dockerfile or dockerignore presence.
 */
export class DockerDetector implements Detector {
  readonly id = 'docker';
  readonly label = 'Docker';
  readonly category = CapabilityCategory.Container;
  readonly role = 'containerizer';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    if (context.fileSystem.hasFile('Dockerfile')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: 'Dockerfile' },
        message: 'Found "Dockerfile" in repository',
        weight: WEIGHTS.DOCKERFILE,
      });
    }

    if (context.fileSystem.hasFile('.dockerignore')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: '.dockerignore' },
        message: 'Found ".dockerignore" in repository',
        weight: WEIGHTS.DOCKERIGNORE,
      });
    }

    return { evidence };
  }
}
