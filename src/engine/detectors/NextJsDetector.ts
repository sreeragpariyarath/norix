import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  DEPENDENCY: 0.8,
  CONFIG: 0.9,
  ROUTER: 0.5,
  ENV: 0.6,
};

/**
 * Capability detector for the Next.js framework.
 * Gathers evidence across manifests, file presence, and configuration files.
 */
export class NextJsDetector implements Detector {
  readonly id = 'nextjs';
  readonly label = 'Next.js';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'meta-framework';
  readonly threshold = 0.3;

  /**
   * Scans the repository context and gathers items of evidence of Next.js.
   */
  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    // 1. Dependency matching
    if (context.node.hasPackage('next')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "next" in package.json dependencies',
        weight: WEIGHTS.DEPENDENCY,
      });

      const v = context.node.getPackageVersion('next');
      if (v) version = v;
    }

    // 2. Config file matches
    const configs = ['next.config.js', 'next.config.mjs', 'next.config.ts'];
    for (const config of configs) {
      if (context.fileSystem.hasFile(config)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.Config, name: config },
          message: `Found Next.js configuration file "${config}"`,
          weight: WEIGHTS.CONFIG,
        });
      }
    }

    // 3. App / Pages routing folders presence
    const routeFolders = ['app', 'src/app', 'pages', 'src/pages'];
    for (const folder of routeFolders) {
      if (context.fileSystem.hasFile(folder)) {
        evidence.push({
          type: EvidenceType.FilePresence,
          source: { type: EvidenceSourceType.File, name: folder },
          message: `Found routing directory "${folder}"`,
          weight: WEIGHTS.ROUTER,
        });
      }
    }

    // 4. TS env declarations presence
    if (context.fileSystem.hasFile('next-env.d.ts')) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.File, name: 'next-env.d.ts' },
        message: 'Found "next-env.d.ts" configuration environment file',
        weight: WEIGHTS.ENV,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }

    return result;
  }
}
