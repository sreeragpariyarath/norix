import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  CYPRESS_DEPENDENCY: 1.0,
  CYPRESS_CONFIG: 0.9,
  CYPRESS_DIR: 0.7,
};

/**
 * Capability detector for Cypress end-to-end testing.
 * Cypress is always a devDependency.
 * Uses hasPackage() which checks both dependencies and devDependencies.
 */
export class CypressDetector implements Detector {
  readonly id = 'cypress';
  readonly label = 'Cypress';
  readonly category = CapabilityCategory.Testing;
  readonly role = 'e2e-testing';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    if (context.node.hasPackage('cypress')) {
      evidence.push({
        type: EvidenceType.Dependency,
        source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
        message: 'Found "cypress" in package.json (devDependency)',
        weight: WEIGHTS.CYPRESS_DEPENDENCY,
      });

      const v = context.node.getPackageVersion('cypress');
      if (v) version = v;
    }

    if (
      context.fileSystem.hasFile('cypress.config.ts') ||
      context.fileSystem.hasFile('cypress.config.js')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'cypress.config.ts' },
        message: 'Found Cypress configuration file',
        weight: WEIGHTS.CYPRESS_CONFIG,
      });
    }

    if (
      context.fileSystem.hasFile('cypress/e2e') ||
      context.fileSystem.hasFile('cypress/integration')
    ) {
      evidence.push({
        type: EvidenceType.FilePresence,
        source: { type: EvidenceSourceType.Config, name: 'cypress/' },
        message: 'Found Cypress test directory',
        weight: WEIGHTS.CYPRESS_DIR,
      });
    }

    const result: { evidence: Evidence[]; version?: string } = { evidence };
    if (version !== undefined) {
      result.version = version;
    }
    return result;
  }
}
