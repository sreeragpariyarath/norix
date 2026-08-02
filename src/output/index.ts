import { OutputFormatter } from './OutputFormatter.js';
import { JsonFormatter } from './JsonFormatter.js';
import { YamlFormatter } from './YamlFormatter.js';
import { CsvFormatter } from './CsvFormatter.js';
import { MarkdownFormatter } from './MarkdownFormatter.js';
import { SarifFormatter } from './SarifFormatter.js';
import { SummaryFormatter } from './SummaryFormatter.js';

export * from './OutputFormatter.js';
export * from './JsonFormatter.js';
export * from './YamlFormatter.js';
export * from './CsvFormatter.js';
export * from './MarkdownFormatter.js';
export * from './SarifFormatter.js';
export * from './SummaryFormatter.js';

/**
 * Resolves the appropriate formatter matching the format key.
 *
 * @param format Target format key (e.g. 'json', 'yaml', 'summary', etc.)
 * @returns Formatter instance
 * @throws Error if the format key is unsupported
 */
export function getFormatter(format: string): OutputFormatter {
  switch (format.toLowerCase()) {
    case 'json':
      return new JsonFormatter();
    case 'yaml':
      return new YamlFormatter();
    case 'csv':
      return new CsvFormatter();
    case 'markdown':
      return new MarkdownFormatter();
    case 'sarif':
      return new SarifFormatter();
    case 'summary':
      return new SummaryFormatter();
    default:
      throw new Error(`Unsupported output format: "${format}"`);
  }
}
