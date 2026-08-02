import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  K8S_DIR: 1.0,
};

/**
 * Capability detector for Kubernetes orchestration.
 * Gathers evidence based on kubernetes manifests/directories presence.
 */
export class KubernetesDetector implements Detector {
  readonly id = 'kubernetes';
  readonly label = 'Kubernetes';
  readonly category = CapabilityCategory.Container;
  readonly role = 'orchestrator';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const k8sDirs = ['k8s', 'kubernetes'];
    for (const dir of k8sDirs) {
      if (context.fileSystem.hasFile(dir)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.File, name: dir },
          message: `Found Kubernetes configurations folder "${dir}/"`,
          weight: WEIGHTS.K8S_DIR,
        });
      }
    }

    return { evidence };
  }
}
