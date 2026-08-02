import { Detector } from '../types/Detector.js';
import { CapabilityCategory } from '../types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../types/Evidence.js';
import { EvidenceContext } from '../context/EvidenceContext.js';

const WEIGHTS = {
  SQLITE_DEPENDENCY: 1.0,
};

/**
 * Capability detector for the SQLite database.
 * Gathers evidence based on package manifest declarations.
 */
export class SqliteDetector implements Detector {
  readonly id = 'sqlite';
  readonly label = 'SQLite';
  readonly category = CapabilityCategory.Database;
  readonly role = 'relational-driver';
  readonly threshold = 0.3;

  async detect(context: EvidenceContext): Promise<{
    evidence: Evidence[];
    version?: string;
  }> {
    const evidence: Evidence[] = [];
    let version: string | undefined;

    const sqlitePackages = ['better-sqlite3', 'sqlite3', '@sqlite.org/sqlite-wasm'];
    for (const pkg of sqlitePackages) {
      if (context.node.hasPackage(pkg)) {
        evidence.push({
          type: EvidenceType.Dependency,
          source: { type: EvidenceSourceType.Manifest, name: 'package.json' },
          message: `Found SQLite driver "${pkg}" dependency in package.json`,
          weight: WEIGHTS.SQLITE_DEPENDENCY,
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
