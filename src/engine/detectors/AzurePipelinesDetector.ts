import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  AZURE_PIPELINES: 1.0,
};

/**
 * Capability detector for Azure Pipelines CI/CD.
 * Gathers evidence based on pipeline yaml file presence.
 */
export class AzurePipelinesDetector implements Detector {
  readonly id = 'azure-pipelines';
  readonly label = 'Azure Pipelines';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'ci-cd';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];

    const pipelineFiles = ['azure-pipelines.yml', 'azure-pipelines.yaml'];
    for (const file of pipelineFiles) {
      if (context.fileSystem.hasFile(file)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: file },
          message: `Found Azure Pipelines configuration file "${file}"`,
          weight: WEIGHTS.AZURE_PIPELINES,
        });
      }
    }

    return { evidence };
  }
}
