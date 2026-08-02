import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  COMPOSE_FILE: 1.0,
};

/**
 * Capability detector for Docker Compose orchestration.
 * Gathers evidence based on compose configuration presence.
 */
export class DockerComposeDetector implements Detector {
  readonly id = 'docker-compose';
  readonly label = 'Docker Compose';
  readonly category = CapabilityCategory.Container;
  readonly role = 'orchestrator';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const composeFiles = [
      'docker-compose.yml',
      'docker-compose.yaml',
      'compose.yml',
      'compose.yaml',
    ];
    for (const file of composeFiles) {
      if (context.fileSystem.hasFile(file)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: file },
          message: `Found Docker Compose file "${file}"`,
          weight: WEIGHTS.COMPOSE_FILE,
        });
      }
    }

    try {
      const parsed = await context.configs.getDockerCompose();
      if (parsed?.version) {
        version = parsed.version;
      }
    } catch {
      // Ignore config parse failure
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
