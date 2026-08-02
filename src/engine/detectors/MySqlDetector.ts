import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  MYSQL_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the MySQL database.
 * Gathers evidence based on package manifest declarations.
 */
export class MySqlDetector implements Detector {
  readonly id = 'mysql';
  readonly label = 'MySQL';
  readonly category = CapabilityCategory.Database;
  readonly role = 'relational-driver';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const mysqlPackages = ['mysql2', 'mysql'];
    for (const pkg of mysqlPackages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found MySQL driver "${pkg}" dependency in package.json`,
          weight: WEIGHTS.MYSQL_DEPENDENCY,
        });

        if (!version) {
          const v = context.node.getPackageVersion(pkg);
          if (v) version = v;
        }
      }
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
