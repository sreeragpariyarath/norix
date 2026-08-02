import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  TURBO_DEPENDENCY: 0.8,
  TURBO_CONFIG: 1.0,
};

/**
 * Capability detector for Turborepo.
 * Gathers evidence based on config file and package declarations.
 */
export class TurboRepoDetector implements Detector {
  readonly id = 'turborepo';
  readonly label = 'Turborepo';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'monorepo-tool';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('turbo')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "turbo" dependency in package.json',
        weight: WEIGHTS.TURBO_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('turbo');
      if (v) version = v;
    }

    if (context.fileSystem.hasFile('turbo.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'turbo.json' },
        message: 'Found Turborepo configuration file "turbo.json"',
        weight: WEIGHTS.TURBO_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
