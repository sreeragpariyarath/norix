import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  REACT_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the React library.
 * Gathers evidence based on package manifest declarations.
 */
export class ReactDetector implements Detector {
  readonly id = 'react';
  readonly label = 'React';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'ui-library';
  readonly threshold = 0.3;

  /**
   * Scans the repository context and gathers items of evidence of React.
   */
  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('react')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "react" dependency in package.json',
        weight: WEIGHTS.REACT_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('react');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
