import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  TYPEORM_DEPENDENCY: 0.8,
  TYPEORM_CONFIG: 1.0,
};

/**
 * Capability detector for the TypeORM tool.
 * Gathers evidence from package manifests and config files.
 */
export class TypeOrmDetector implements Detector {
  readonly id = 'typeorm';
  readonly label = 'TypeORM';
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
    if (context.node.hasPackage('typeorm')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "typeorm" dependency in package.json',
        weight: WEIGHTS.TYPEORM_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('typeorm');
      if (v) version = v;
    }

    // 2. Config file checks
    const configs = [
      'ormconfig.json',
      'ormconfig.js',
      'ormconfig.ts',
      'ormconfig.yml',
      'ormconfig.yaml',
    ];
    for (const config of configs) {
      if (context.fileSystem.hasFile(config)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: config },
          message: `Found TypeORM configuration file "${config}"`,
          weight: WEIGHTS.TYPEORM_CONFIG,
        });
      }
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
