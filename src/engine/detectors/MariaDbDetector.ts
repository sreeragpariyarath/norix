import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  MARIADB_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the MariaDB database.
 * Gathers evidence based on package manifest declarations.
 */
export class MariaDbDetector implements Detector {
  readonly id = 'mariadb';
  readonly label = 'MariaDB';
  readonly category = CapabilityCategory.Database;
  readonly role = 'relational-driver';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('mariadb')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "mariadb" dependency in package.json',
        weight: WEIGHTS.MARIADB_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('mariadb');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
