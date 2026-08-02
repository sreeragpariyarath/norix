import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  REDIS_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the Redis cache manager.
 * Gathers evidence based on package manifest declarations.
 */
export class RedisDetector implements Detector {
  readonly id = 'redis';
  readonly label = 'Redis';
  readonly category = CapabilityCategory.Cache;
  readonly role = 'redis-client';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const redisPackages = ['redis', 'ioredis'];
    for (const pkg of redisPackages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found Redis client "${pkg}" dependency in package.json`,
          weight: WEIGHTS.REDIS_DEPENDENCY,
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
