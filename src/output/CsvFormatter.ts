import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

/**
 * Output formatter that produces a flat CSV table listing one capability match per row.
 */
export class CsvFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    const headers = ['repository', 'category', 'capability', 'role', 'matchedPackages'];
    const rows = [headers.join(',')];

    for (const [category, matches] of Object.entries(result.capabilities)) {
      if (!matches) continue;
      for (const match of matches) {
        const pkgs = match.matchedPackages ? match.matchedPackages.join(';') : '';
        const line = [result.repoName, category, match.label, match.role, pkgs].map((val) => {
          const str = String(val).replace(/"/g, '""');
          if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str}"`;
          }
          return str;
        });
        rows.push(line.join(','));
      }
    }

    return rows.join('\n') + '\n';
  }
}
