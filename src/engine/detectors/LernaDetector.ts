import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  LERNA_DEPENDENCY: 0.8,
  LERNA_CONFIG: 1.0,
};

/**
 * Capability detector for Lerna workspaces.
 * Gathers evidence based on configuration and package declarations.
 */
export class LernaDetector implements Detector {
  readonly id = 'lerna';
  readonly label = 'Lerna';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'monorepo-tool';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('lerna')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "lerna" dependency in package.json',
        weight: WEIGHTS.LERNA_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('lerna');
      if (v) version = v;
    }

    if (context.fileSystem.hasFile('lerna.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'lerna.json' },
        message: 'Found Lerna configuration file "lerna.json"',
        weight: WEIGHTS.LERNA_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
