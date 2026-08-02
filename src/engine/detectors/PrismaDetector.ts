import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  PRISMA_DEPENDENCY: 0.8,
  PRISMA_SCHEMA: 1.0,
};

/**
 * Capability detector for the Prisma ORM tool.
 * Gathers evidence from package manifests and schema configurations.
 */
export class PrismaDetector implements Detector {
  readonly id = 'prisma';
  readonly label = 'Prisma';
  readonly category = CapabilityCategory.ORM;
  readonly role = 'relational-orm';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    // 1. Package dependency check
    const prismaPackages = ['@prisma/client', 'prisma'];
    for (const pkg of prismaPackages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found Prisma package "${pkg}" dependency in package.json`,
          weight: WEIGHTS.PRISMA_DEPENDENCY,
        });

        if (!version) {
          const v = context.node.getPackageVersion(pkg);
          if (v) version = v;
        }
      }
    }

    // 2. Schema configuration file check
    if (context.fileSystem.hasFile('prisma/schema.prisma')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'prisma/schema.prisma' },
        message: 'Found Prisma schema file "prisma/schema.prisma"',
        weight: WEIGHTS.PRISMA_SCHEMA,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
