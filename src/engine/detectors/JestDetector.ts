import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  JEST_DEPENDENCY: 1.0,
  JEST_CONFIG: 0.8,
};

/**
 * Capability detector for Jest test runner.
 * Jest is almost always a devDependency.
 * Uses hasPackage() which checks both dependencies and devDependencies.
 */
export class JestDetector implements Detector {
  readonly id = 'jest';
  readonly label = 'Jest';
  readonly category = CapabilityCategory.Testing;
  readonly role = 'test-runner';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('jest')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "jest" in package.json (devDependency)',
        weight: WEIGHTS.JEST_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('jest');
      if (v) version = v;
    }

    if (
      context.fileSystem.hasFile('jest.config.ts') ||
      context.fileSystem.hasFile('jest.config.js') ||
      context.fileSystem.hasFile('jest.config.mjs')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'jest.config.js' },
        message: 'Found Jest configuration file',
        weight: WEIGHTS.JEST_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }
    return result;
  }
}
