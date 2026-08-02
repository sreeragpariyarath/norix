import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  VITE_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the Vite build tool.
 * Gathers evidence based on package manifest declarations.
 */
export class ViteDetector implements Detector {
  readonly id = 'vite';
  readonly label = 'Vite';
  readonly category = CapabilityCategory.BuildTool;
  readonly role = 'bundler';
  readonly threshold = 0.3;

  /**
   * Scans the repository context and gathers items of evidence of Vite.
   */
  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('vite')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "vite" dependency in package.json',
        weight: WEIGHTS.VITE_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('vite');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
