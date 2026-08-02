import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  WRANGLER_CONFIG: 1.0,
  WORKERS_TYPES: 0.5,
};

/**
 * Capability detector for Cloudflare Workers.
 * Gathers evidence based on wrangler configurations and dependencies.
 */
export class CloudflareWorkersDetector implements Detector {
  readonly id = 'cloudflare-workers';
  readonly label = 'Cloudflare Workers';
  readonly category = CapabilityCategory.Cloud;
  readonly role = 'deployment-platform';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const configFiles = ['wrangler.toml', 'wrangler.json'];
    for (const file of configFiles) {
      if (context.fileSystem.hasFile(file)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: file },
          message: `Found Cloudflare wrangler configuration "${file}"`,
          weight: WEIGHTS.WRANGLER_CONFIG,
        });
      }
    }

    if (context.node.hasPackage('@cloudflare/workers-types')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "@cloudflare/workers-types" dependency in package.json',
        weight: WEIGHTS.WORKERS_TYPES,
      });

      const v = context.node.getPackageVersion('@cloudflare/workers-types');
      if (v) version = v;
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
