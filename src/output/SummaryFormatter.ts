import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

/**
 * Output formatter that produces a polished summary of capability groups and confidence ratings in plain text.
 */
export class SummaryFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    const frontend: string[] = [];
    const backend: string[] = [];
    const database: string[] = [];
    const orm: string[] = [];
    const infra: string[] = [];
    const deployment: string[] = [];

    // Group matching capabilities
    for (const [category, matches] of Object.entries(result.capabilities)) {
      if (!matches) continue;
      for (const match of matches) {
        if (category === 'framework') {
          if (match.role === 'ui-library' || match.role === 'meta-framework') {
            frontend.push(match.label);
          } else if (match.role === 'server-framework') {
            backend.push(match.label);
          } else {
            backend.push(match.label);
          }
        } else if (category === 'database') {
          database.push(match.label);
        } else if (category === 'orm') {
          orm.push(match.label);
        } else if (category === 'cloud') {
          deployment.push(match.label);
        } else if (['build', 'container', 'packageManager', 'ci-cd'].includes(category)) {
          infra.push(match.label);
        } else {
          infra.push(match.label);
        }
      }
    }

    let out = '\nRepository\n';
    out += '────────────────────────\n\n';

    if (frontend.length > 0) {
      out += 'Frontend\n\n';
      out += frontend.map((f) => `✓ ${f}`).join('\n\n') + '\n\n';
    }

    if (backend.length > 0) {
      out += 'Backend\n\n';
      out += backend.map((b) => `✓ ${b}`).join('\n\n') + '\n\n';
    }

    if (database.length > 0) {
      out += 'Database\n\n';
      out += database.map((d) => `✓ ${d}`).join('\n\n') + '\n\n';
    }

    if (orm.length > 0) {
      out += 'ORM\n\n';
      out += orm.map((o) => `✓ ${o}`).join('\n\n') + '\n\n';
    }

    if (infra.length > 0) {
      out += 'Infrastructure\n\n';
      out += infra.map((i) => `✓ ${i}`).join('\n\n') + '\n\n';
    }

    if (deployment.length > 0) {
      out += 'Deployment\n\n';
      out += deployment.map((d) => `✓ ${d}`).join('\n\n') + '\n\n';
    }

    out += 'Confidence\n\n';
    const allMatches = Object.values(result.capabilities).flat().filter(Boolean);
    if (allMatches.length === 0) {
      out += 'No capabilities matched.\n';
    } else {
      for (const m of allMatches) {
        if (!m) continue;
        const dots = '.'.repeat(Math.max(2, 20 - m.label.length));
        out += `${m.label} ${dots}100%\n\n`;
      }
    }

    return out;
  }
}
