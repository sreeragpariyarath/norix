import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  PLAYWRIGHT_DEPENDENCY: 1.0,
  PLAYWRIGHT_CONFIG: 0.9,
};

/**
 * Capability detector for Playwright end-to-end testing.
 * Playwright packages are always devDependencies.
 * Uses hasPackage() which checks both dependencies and devDependencies.
 */
export class PlaywrightDetector implements Detector {
  readonly id = 'playwright';
  readonly label = 'Playwright';
  readonly category = CapabilityCategory.Testing;
  readonly role = 'e2e-testing';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const packages = ['@playwright/test', 'playwright'];
    for (const pkg of packages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found "${pkg}" in package.json (devDependency)`,
          weight: WEIGHTS.PLAYWRIGHT_DEPENDENCY,
        });

        const v = context.node.getPackageVersion(pkg);
        if (v) version = v;
        break;
      }
    }

    if (
      context.fileSystem.hasFile('playwright.config.ts') ||
      context.fileSystem.hasFile('playwright.config.js')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'playwright.config.ts' },
        message: 'Found Playwright configuration file',
        weight: WEIGHTS.PLAYWRIGHT_CONFIG,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }
    return result;
  }
}
