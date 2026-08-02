import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  MONGOOSE_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the Mongoose ORM tool.
 * Gathers evidence based on package manifest declarations.
 */
export class MongooseDetector implements Detector {
  readonly id = 'mongoose';
  readonly label = 'Mongoose';
  readonly category = CapabilityCategory.ORM;
  readonly role = 'document-orm';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('mongoose')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "mongoose" dependency in package.json',
        weight: WEIGHTS.MONGOOSE_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('mongoose');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
