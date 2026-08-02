import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  NX_DEPENDENCY: 0.8,
  NX_CONFIG: 1.0,
};

/**
 * Capability detector for Nx workspaces.
 * Gathers evidence based on configuration and package declarations.
 */
export class NxDetector implements Detector {
  readonly id = 'nx';
  readonly label = 'Nx';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'monorepo-tool';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('nx')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "nx" dependency in package.json',
        weight: WEIGHTS.NX_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('nx');
      if (v) version = v;
    }

    if (context.fileSystem.hasFile('nx.json')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'nx.json' },
        message: 'Found Nx configuration file "nx.json"',
        weight: WEIGHTS.NX_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
