/**
 * Norix CLI Entry Point — Routing & Flag Parsing
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { handleAnalyze, handleDoctor, handleReport } from './commands/index.js';
import { renderError } from './renderer.js';
import type { ReportFormat } from './types.js';

const VERSION = '1.0.0';

const HELP = `
  norix — Repository Analysis CLI  (v${VERSION})

  Usage:
    norix <command> [options]

  Commands:
    analyze          Show repository overview  (default)
    doctor           Show repository health and capability overlaps
    report           Generate Markdown and JSON reports

  Global Options:
    --cwd <path>     Set working directory  (default: current directory)
    --version, -v    Show version number
    --help, -h       Show this help message

  Command Options:
    analyze
      --json           Output as JSON to stdout

    doctor
      --json           Output findings as JSON to stdout
      --severity       Filter: warning | info | all  (default: all)

    report
      --format         markdown | json | all  (default: all)
      --output <dir>   Output directory  (default: current directory)
      --no-doctor      Exclude health findings from report

  Examples:
    norix analyze
    norix analyze --cwd ./my-project
    norix analyze --json | jq '.capabilities.framework'
    norix doctor
    norix doctor --severity warning
    norix report
    norix report --format markdown --output ./docs
`;

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      cwd: { type: 'string', short: 'c' },
      version: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      json: { type: 'boolean', default: false },
      severity: { type: 'string', default: 'all' },
      format: { type: 'string', default: 'all' },
      output: { type: 'string', short: 'o' },
      'no-doctor': { type: 'boolean', default: false },
      engine: { type: 'string', default: 'legacy' },
    },
    allowPositionals: true,
    strict: false,
  });

  if (values.version) {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  if (values.help) {
    process.stdout.write(HELP + '\n');
    process.exit(0);
  }

  const command = positionals[0] ?? 'analyze';
  const cwd = typeof values.cwd === 'string' ? resolve(values.cwd) : process.cwd();
  const isJson = Boolean(values.json);
  const severityStr = typeof values.severity === 'string' ? values.severity : 'all';
  const formatStr = typeof values.format === 'string' ? values.format : 'all';
  const outputDir = typeof values.output === 'string' ? resolve(values.output) : cwd;
  const noDoctor = Boolean(values['no-doctor']);
  const engine = typeof values.engine === 'string' ? values.engine : 'legacy';

  if (command === 'doctor' && !['warning', 'info', 'all'].includes(severityStr)) {
    renderError(`Invalid --severity value: "${severityStr}". Valid values: warning, info, all`);
    process.exit(2);
  }

  if (command === 'analyze') {
    const resolvedFormat = values.json
      ? 'json'
      : values.format === 'all' || !values.format
        ? 'summary'
        : (values.format as string);
    const validAnalyzeFormats = ['summary', 'json', 'yaml', 'markdown', 'csv', 'sarif'];
    if (!validAnalyzeFormats.includes(resolvedFormat)) {
      renderError(
        `Invalid format value: "${resolvedFormat}". Valid values: summary, json, yaml, markdown, csv, sarif`,
      );
      process.exit(2);
    }
  }

  const validFormats = ['markdown', 'json', 'all'];
  if (command === 'report' && !validFormats.includes(formatStr)) {
    renderError(`Invalid --format value: "${formatStr}". Valid values: markdown, json, all`);
    process.exit(2);
  }

  try {
    switch (command) {
      case 'analyze': {
        const formatVal = values.json
          ? 'json'
          : values.format === 'all' || !values.format
            ? 'summary'
            : (values.format as string);
        await handleAnalyze(cwd, formatVal, VERSION, engine);
        break;
      }

      case 'doctor': {
        await handleDoctor(cwd, isJson, severityStr, VERSION);
        break;
      }

      case 'report': {
        await handleReport(cwd, formatStr as ReportFormat, outputDir, !noDoctor);
        break;
      }

      default: {
        renderError(`Unknown command: "${command}". Run 'norix --help' to see available commands.`);
        process.exit(1);
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    renderError(message);
    process.exit(1);
  }
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`\nUnexpected error: ${message}\n`);
  process.exit(1);
});
