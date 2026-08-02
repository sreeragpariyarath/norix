import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  DRIZZLE_DEPENDENCY: 0.8,
  DRIZZLE_CONFIG: 1.0,
};

/**
 * Capability detector for the Drizzle ORM tool.
 * Gathers evidence from package manifests and config files.
 */
export class DrizzleDetector implements Detector {
  readonly id = 'drizzle';
  readonly label = 'Drizzle';
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
    if (context.node.hasPackage('drizzle-orm')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "drizzle-orm" dependency in package.json',
        weight: WEIGHTS.DRIZZLE_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('drizzle-orm');
      if (v) version = v;
    }

    // 2. Config files checks
    const configs = ['drizzle.config.ts', 'drizzle.config.js', 'drizzle.config.json'];
    for (const config of configs) {
      if (context.fileSystem.hasFile(config)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: config },
          message: `Found Drizzle configuration file "${config}"`,
          weight: WEIGHTS.DRIZZLE_CONFIG,
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
