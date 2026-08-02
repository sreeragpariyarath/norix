import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

/**
 * Output formatter that constructs valid SARIF v2.1.0 JSON payloads.
 */
export class SarifFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    const rules: unknown[] = [];
    const results: unknown[] = [];

    for (const [category, matches] of Object.entries(result.capabilities)) {
      if (!matches) continue;
      for (const match of matches) {
        const ruleId = `NORIX-${category}-${match.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        rules.push({
          id: ruleId,
          shortDescription: {
            text: `Detected ${match.label} (${category})`,
          },
          fullDescription: {
            text: `Repository implements ${match.label} capability serving as a ${match.role}.`,
          },
        });

        results.push({
          ruleId,
          message: {
            text: `Detected capability: ${match.label} (${match.role})`,
          },
          locations: [
            {
              physicalLocation: {
                artifactLocation: {
                  uri: 'package.json',
                  uriBaseId: 'SRCROOT',
                },
                region: {
                  startLine: 1,
                  startColumn: 1,
                },
              },
            },
          ],
        });
      }
    }

    const sarif = {
      $schema: 'https://schemastore.azurewebsites.net/schemas/json/sarif-2.1.0-rtm.5.json',
      version: '2.1.0',
      runs: [
        {
          tool: {
            driver: {
              name: 'Norix',
              version: '2.0.0',
              informationUri: 'https://github.com/sreeragpariyarath/norix',
              rules,
            },
          },
          results,
        },
      ],
    };

    return JSON.stringify(sarif, null, 2) + '\n';
  }
}
