import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  SEQUELIZE_DEPENDENCY: 0.8,
  SEQUELIZE_CONFIG: 1.0,
};

/**
 * Capability detector for the Sequelize ORM tool.
 * Gathers evidence from package manifests and config files.
 */
export class SequelizeDetector implements Detector {
  readonly id = 'sequelize';
  readonly label = 'Sequelize';
  readonly category = CapabilityCategory.ORM;
  readonly role = 'relational-orm';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    // 1. Dependency check
    const sequelizePackages = ['sequelize', 'sequelize-typescript'];
    for (const pkg of sequelizePackages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found Sequelize package "${pkg}" dependency in package.json`,
          weight: WEIGHTS.SEQUELIZE_DEPENDENCY,
        });

        if (!version) {
          const v = context.node.getPackageVersion(pkg);
          if (v) version = v;
        }
      }
    }

    // 2. RC Configuration check
    if (context.fileSystem.hasFile('.sequelizerc')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: '.sequelizerc' },
        message: 'Found Sequelize configuration file ".sequelizerc"',
        weight: WEIGHTS.SEQUELIZE_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
