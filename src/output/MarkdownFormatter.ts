import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

/**
 * Output formatter that generates a formatted markdown document detailing scanned capabilities.
 */
export class MarkdownFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    let md = `# Norix Analysis Report: ${result.repoName}\n\n`;
    md += `* **Repository Root:** \`${result.repoRoot}\`\n`;
    md += `* **Language:** ${result.language}\n`;
    md += `* **Package Manager:** ${result.packageManager}\n`;
    md += `* **Monorepo:** ${result.isMonorepo ? 'Yes' : 'No'}\n`;
    if (result.isMonorepo && result.workspaceNames.length > 0) {
      md += `* **Workspaces:** ${result.workspaceNames.map((w) => `\`${w}\``).join(', ')}\n`;
    }
    md += `* **Files Scanned:** ${result.packageJsonCount} package.json files\n`;
    md += `* **Duration:** ${Math.round(result.duration)}ms\n\n`;

    md += `## Capabilities Summary\n\n`;

    const categories = Object.keys(result.capabilities);
    if (categories.length === 0) {
      md += `No capabilities detected.\n`;
    } else {
      md += `| Category | Capability | Role | Matched Packages |\n`;
      md += `| --- | --- | --- | --- |\n`;

      for (const [category, matches] of Object.entries(result.capabilities)) {
        if (!matches) continue;
        for (const match of matches) {
          const pkgs =
            match.matchedPackages && match.matchedPackages.length > 0
              ? match.matchedPackages.map((p) => `\`${p}\``).join(', ')
              : '_None_';
          md += `| **${category}** | ${match.label} | \`${match.role}\` | ${pkgs} |\n`;
        }
      }
    }

    return md;
  }
}
