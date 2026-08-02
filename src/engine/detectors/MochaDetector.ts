import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  MOCHA_DEPENDENCY: 1.0,
  MOCHA_CONFIG: 0.7,
};

/**
 * Capability detector for the Mocha test framework.
 * Mocha is always a devDependency.
 * Uses hasPackage() which checks both dependencies and devDependencies.
 */
export class MochaDetector implements Detector {
  readonly id = 'mocha';
  readonly label = 'Mocha';
  readonly category = CapabilityCategory.Testing;
  readonly role = 'test-runner';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('mocha')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "mocha" in package.json (devDependency)',
        weight: WEIGHTS.MOCHA_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('mocha');
      if (v) version = v;
    }

    if (
      context.fileSystem.hasFile('.mocharc.js') ||
      context.fileSystem.hasFile('.mocharc.cjs') ||
      context.fileSystem.hasFile('.mocharc.yml') ||
      context.fileSystem.hasFile('.mocharc.yaml') ||
      context.fileSystem.hasFile('.mocharc.json')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: '.mocharc' },
        message: 'Found Mocha configuration file',
        weight: WEIGHTS.MOCHA_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }
    return result;
  }
}
