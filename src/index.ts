/**
 * Norix CLI Entry Point — Phase 1
 *
 * Commands:
 *   norix analyze   — repository overview
 *   norix doctor    — capability health check
 *   norix report    — generate Markdown + JSON reports
 */

import { parseArgs } from 'node:util';
import { resolve } from 'node:path';
import { scan } from './scanner.js';
import { analyze } from './analyzer.js';
import { runDoctor } from './doctor.js';
import { writeReports } from './report.js';
import { renderAnalysis, renderDoctor, renderError, renderReportSuccess } from './renderer.js';
import type { AnalysisResult, ReportFormat } from './types.js';

// ─── Version ──────────────────────────────────────────────────────────────────

const VERSION = '0.5.0';

// ─── Help Text ────────────────────────────────────────────────────────────────

const HELP = `
  norix — Repository Intelligence CLI  (v${VERSION})

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

// ─── Shared: Run Scan + Analyze ───────────────────────────────────────────────

async function runScanAndAnalyze(cwd: string): Promise<AnalysisResult> {
  const scanResult = await scan(cwd);
  return analyze(scanResult);
}

// ─── JSON Serializers ─────────────────────────────────────────────────────────

function analyzeToJson(result: AnalysisResult): unknown {
  return {
    $schema: 'https://norix.dev/schemas/analyze/v1.json',
    version: '1',
    norixVersion: VERSION,
    timestamp: new Date().toISOString(),
    repository: {
      name: result.repoName,
      root: result.repoRoot,
      isMonorepo: result.isMonorepo,
      workspaces: result.workspaceNames,
      language: result.language,
      packageManager: result.packageManager,
    },
    capabilities: result.capabilities,
    meta: {
      packageJsonCount: result.packageJsonCount,
      durationMs: Math.round(result.duration),
    },
  };
}

function doctorToJson(
  analysis: AnalysisResult,
  doctor: import('./types.js').DoctorResult,
): unknown {
  return {
    $schema: 'https://norix.dev/schemas/doctor/v1.json',
    version: '1',
    norixVersion: VERSION,
    timestamp: new Date().toISOString(),
    repository: {
      name: analysis.repoName,
      isMonorepo: analysis.isMonorepo,
      language: analysis.language,
      packageManager: analysis.packageManager,
    },
    findings: doctor.findings,
    summary: doctor.summary,
    meta: {
      durationMs: Math.round(analysis.duration + doctor.duration),
    },
  };
}

// ─── Command Handlers ─────────────────────────────────────────────────────────

async function cmdAnalyze(cwd: string, asJson: boolean): Promise<void> {
  const result = await runScanAndAnalyze(cwd);
  if (asJson) {
    process.stdout.write(JSON.stringify(analyzeToJson(result), null, 2) + '\n');
  } else {
    renderAnalysis(result);
  }
}

async function cmdDoctor(
  cwd: string,
  asJson: boolean,
  severity: string,
): Promise<void> {
  const analysis = await runScanAndAnalyze(cwd);
  const doctor = runDoctor(analysis);

  // Apply severity filter
  const filtered = {
    ...doctor,
    findings:
      severity === 'all'
        ? doctor.findings
        : doctor.findings.filter((f) => f.severity === severity),
    summary: {
      total: 0,
      warning: 0,
      info: 0,
    },
  };

  filtered.summary.total = filtered.findings.length;
  filtered.summary.warning = filtered.findings.filter(
    (f) => f.severity === 'warning',
  ).length;
  filtered.summary.info = filtered.findings.filter(
    (f) => f.severity === 'info',
  ).length;

  if (asJson) {
    process.stdout.write(
      JSON.stringify(doctorToJson(analysis, filtered), null, 2) + '\n',
    );
  } else {
    renderDoctor(analysis, filtered);
  }
}

async function cmdReport(
  cwd: string,
  format: ReportFormat,
  outputDir: string,
  includeDoctor: boolean,
): Promise<void> {
  const analysis = await runScanAndAnalyze(cwd);
  const doctor = includeDoctor ? runDoctor(analysis) : null;

  const report = writeReports(
    { format, outputDir, includeDoctor },
    analysis,
    doctor,
  );

  renderReportSuccess(report);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      // Global
      cwd: { type: 'string', short: 'c' },
      version: { type: 'boolean', short: 'v', default: false },
      help: { type: 'boolean', short: 'h', default: false },
      // analyze + doctor
      json: { type: 'boolean', default: false },
      // doctor
      severity: { type: 'string', default: 'all' },
      // report
      format: { type: 'string', default: 'all' },
      output: { type: 'string', short: 'o' },
      'no-doctor': { type: 'boolean', default: false },
    },
    allowPositionals: true,
    strict: false,
  });

  // ── Global flags ─────────────────────────────────────────────────────────

  if (values.version) {
    process.stdout.write(`${VERSION}\n`);
    process.exit(0);
  }

  if (values.help) {
    process.stdout.write(HELP + '\n');
    process.exit(0);
  }

  // ── Command routing ───────────────────────────────────────────────────────

  const command = positionals[0] ?? 'analyze';
  const cwd = values.cwd ? resolve(values.cwd) : process.cwd();

  // Validate severity flag
  if (
    command === 'doctor' &&
    !['warning', 'info', 'all'].includes(values.severity ?? 'all')
  ) {
    renderError(
      `Invalid --severity value: "${values.severity}". Valid values: warning, info, all`,
    );
    process.exit(2);
  }

  // Validate format flag
  const validFormats = ['markdown', 'json', 'all'];
  if (command === 'report' && !validFormats.includes(values.format ?? 'all')) {
    renderError(
      `Invalid --format value: "${values.format}". Valid values: markdown, json, all`,
    );
    process.exit(2);
  }

  try {
    switch (command) {
      case 'analyze': {
        await cmdAnalyze(cwd, values.json ?? false);
        break;
      }

      case 'doctor': {
        await cmdDoctor(cwd, values.json ?? false, values.severity ?? 'all');
        break;
      }

      case 'report': {
        await cmdReport(
          cwd,
          (values.format ?? 'all') as ReportFormat,
          values.output ? resolve(values.output) : cwd,
          !(values['no-doctor'] ?? false),
        );
        break;
      }

      default: {
        renderError(
          `Unknown command: "${command}". Run 'norix --help' to see available commands.`,
        );
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
