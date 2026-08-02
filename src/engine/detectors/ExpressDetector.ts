import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  EXPRESS_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the Express.js framework.
 * Gathers evidence based on package manifest declarations.
 */
export class ExpressDetector implements Detector {
  readonly id = 'express';
  readonly label = 'Express.js';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'server-framework';
  readonly threshold = 0.3;

  /**
   * Scans the repository context and gathers items of evidence of Express.js.
   */
  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('express')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "express" dependency in package.json',
        weight: WEIGHTS.EXPRESS_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('express');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
