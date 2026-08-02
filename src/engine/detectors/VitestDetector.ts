import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  VITEST_DEPENDENCY: 1.0,
  VITEST_CONFIG: 0.8,
};

/**
 * Capability detector for the Vitest test runner.
 * Vitest is a devDependency in virtually every project that uses it.
 * Uses hasPackage() which checks both dependencies and devDependencies.
 */
export class VitestDetector implements Detector {
  readonly id = 'vitest';
  readonly label = 'Vitest';
  readonly category = CapabilityCategory.Testing;
  readonly role = 'test-runner';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('vitest')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "vitest" in package.json (devDependency)',
        weight: WEIGHTS.VITEST_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('vitest');
      if (v) version = v;
    }

    if (
      context.fileSystem.hasFile('vitest.config.ts') ||
      context.fileSystem.hasFile('vitest.config.js') ||
      context.fileSystem.hasFile('vitest.config.mts')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'vitest.config.ts' },
        message: 'Found Vitest configuration file',
        weight: WEIGHTS.VITEST_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }
    return result;
  }
}
