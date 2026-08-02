/**
 * Analyzer
 *
 * Maps a ScanResult (raw installed packages) to an AnalysisResult
 * by matching packages against the Capability Database.
 *
 * Matching rules:
 *  - OR logic: if ANY package in a DbEntry.packages list is installed → match
 *  - Deduplication: a label can only appear once per category
 *  - Order: results follow CATEGORY_ORDER from types.ts
 */

import { DB } from './db/index.js';
import type { AnalysisResult, CapabilityCategory, CapabilityMatch, ScanResult } from './types.js';
import { CATEGORY_ORDER } from './types.js';

export function analyze(scan: ScanResult): AnalysisResult {
  const installedPackages = new Set(scan.allPackages.keys());
  const capabilities: Partial<Record<CapabilityCategory, CapabilityMatch[]>> = {};

  for (const category of CATEGORY_ORDER) {
    const entries = DB[category];
    if (!entries || entries.length === 0) continue;

    const matches: CapabilityMatch[] = [];
    const seenLabels = new Set<string>();

    for (const entry of entries) {
      // Check if any of the declared packages are installed
      const matchedPackages = entry.packages.filter((pkg) => installedPackages.has(pkg));

      if (matchedPackages.length === 0) continue;

      // Deduplicate by label (e.g. both 'prisma' and '@prisma/client' → one 'Prisma' entry)
      if (seenLabels.has(entry.label)) continue;
      seenLabels.add(entry.label);

      matches.push({ label: entry.label, matchedPackages, role: entry.role });
    }

    if (matches.length > 0) {
      capabilities[category] = matches;
    }
  }

  return { ...scan, capabilities };
}
