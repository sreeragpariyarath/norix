import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  MONGODB_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the MongoDB database.
 * Gathers evidence based on package manifest declarations.
 */
export class MongoDbDetector implements Detector {
  readonly id = 'mongodb';
  readonly label = 'MongoDB';
  readonly category = CapabilityCategory.Database;
  readonly role = 'document-driver';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('mongodb')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "mongodb" dependency in package.json',
        weight: WEIGHTS.MONGODB_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('mongodb');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
