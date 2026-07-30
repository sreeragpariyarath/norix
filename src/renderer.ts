/**
 * Renderer
 *
 * Converts AnalysisResult / DoctorResult / GeneratedReport into
 * beautiful terminal output.
 *
 * Design decisions:
 *  - Single runtime dependency: picocolors (500 bytes)
 *  - No external box-drawing libraries — hand-crafted with Unicode chars
 *  - analyze: multiple detections in one category → highlighted yellow
 *  - doctor: ⚠ yellow for warnings, ℹ cyan for info
 *  - Non-TTY safe: colors auto-disabled when piped (picocolors handles this)
 */

import pc from 'picocolors';
import type {
  AnalysisResult,
  CapabilityCategory,
  DoctorResult,
  GeneratedReport,
} from './types.js';
import { CATEGORY_LABELS, CATEGORY_ORDER } from './types.js';

// ─── Layout Constants ─────────────────────────────────────────────────────────

const LABEL_WIDTH = 14;
const RULE_WIDTH = 52;
const REASONING_WIDTH = 50;
const REASONING_INDENT = '     ';

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function indent(content = ''): string {
  return `  ${content}`;
}

function padRight(str: string, len: number): string {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

function rule(): string {
  return indent(pc.dim('─'.repeat(RULE_WIDTH)));
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function row(label: string, value: string): string {
  return indent(`${pc.dim(padRight(label, LABEL_WIDTH))} ${value}`);
}

/**
 * Wraps text to a fixed width, returning an array of indented lines.
 */
function wordWrap(text: string, width: number, lineIndent: string): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    if (current.length > 0 && current.length + word.length + 1 > width) {
      lines.push(lineIndent + current.trimEnd());
      current = word + ' ';
    } else {
      current += word + ' ';
    }
  }
  if (current.trim()) lines.push(lineIndent + current.trimEnd());
  return lines;
}

// ─── Analyze Renderer ─────────────────────────────────────────────────────────

export function renderAnalysis(result: AnalysisResult): void {
  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    indent(
      `${pc.cyan(pc.bold('norix'))}  ${pc.dim('·  Repository Intelligence  ·  v0.5.0')}`,
    ),
  );
  lines.push('');
  lines.push(rule());

  // ── Repository metadata ─────────────────────────────────────────────────
  lines.push('');
  lines.push(row('Repository', pc.bold(pc.white(result.repoName))));
  lines.push(row('Language', pc.white(result.language)));

  if (result.packageManager !== 'unknown') {
    lines.push(row('Package Mgr', pc.white(result.packageManager)));
  }

  if (result.isMonorepo) {
    const wsCount = result.workspaceNames.length;
    const wsLabel =
      wsCount > 0
        ? `Monorepo  ${pc.dim(`(${wsCount} workspaces)`)}`
        : 'Monorepo';
    lines.push(row('Type', pc.white(wsLabel)));
  }

  lines.push('');
  lines.push(rule());

  // ── Capabilities ────────────────────────────────────────────────────────
  lines.push('');

  const detectedCategories = CATEGORY_ORDER.filter(
    (cat) =>
      result.capabilities[cat] && (result.capabilities[cat]?.length ?? 0) > 0,
  );

  if (detectedCategories.length === 0) {
    lines.push(indent(pc.dim('  No known capabilities detected.')));
    lines.push(
      indent(pc.dim('  Ensure package.json dependencies are installed.')),
    );
  } else {
    for (const category of detectedCategories) {
      const matches = result.capabilities[category];
      if (!matches) continue;

      const label = CATEGORY_LABELS[category as CapabilityCategory] ?? category;
      const valueText = matches.map((m) => m.label).join(' · ');

      // Yellow highlight if multiple tools in same category (subtle overlap signal)
      const valueRendered =
        matches.length > 1 ? pc.yellow(valueText) : pc.white(valueText);

      lines.push(row(label, valueRendered));
    }
  }

  lines.push('');
  lines.push(rule());

  // ── Footer ───────────────────────────────────────────────────────────────
  lines.push('');
  const pkgLabel =
    result.packageJsonCount === 1
      ? '1 package.json'
      : `${result.packageJsonCount} package.json files`;

  lines.push(
    indent(pc.dim(`${pkgLabel} scanned  ·  ${formatDuration(result.duration)}`)),
  );
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

// ─── Doctor Renderer ──────────────────────────────────────────────────────────

export function renderDoctor(result: AnalysisResult, doctor: DoctorResult): void {
  const lines: string[] = [];

  // ── Header ──────────────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    indent(
      `${pc.cyan(pc.bold('norix'))}  ${pc.dim('·  Repository Health  ·  v0.5.0')}`,
    ),
  );
  lines.push('');
  lines.push(rule());

  // ── Findings ────────────────────────────────────────────────────────────
  if (doctor.findings.length === 0) {
    lines.push('');
    lines.push(indent(`  ${pc.green('✓')}  ${pc.white('No capability overlaps detected.')}`));
    lines.push(indent(pc.dim('   Your repository looks clean from a capability perspective.')));
    lines.push('');
  } else {
    for (const finding of doctor.findings) {
      lines.push('');

      const isWarning = finding.severity === 'warning';
      const icon = isWarning ? pc.yellow('⚠') : pc.cyan('ℹ');
      const badge = isWarning
        ? pc.yellow('[Warning]')
        : pc.cyan('[Info]');

      // Title line with severity badge
      const titleStr = `Potential Capability Overlap: ${categoryTitle(finding.category)}`;
      const titleLine = `${icon}  ${pc.bold(pc.white(titleStr))}`;
      lines.push(indent(`  ${titleLine}  ${badge}`));
      lines.push('');

      // Evidence
      const evidenceStr = finding.evidence.map((e) => pc.dim(e.package)).join('  ·  ');
      lines.push(indent(`     ${pc.dim('Found:')}  ${evidenceStr}`));
      lines.push('');

      // Reasoning (word-wrapped)
      const wrapped = wordWrap(finding.reasoning, REASONING_WIDTH, REASONING_INDENT);
      for (const line of wrapped) {
        lines.push(indent(pc.dim(line)));
      }

      lines.push('');
      lines.push(rule());
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────────
  lines.push('');

  if (doctor.findings.length > 0) {
    const total = `${doctor.summary.total} finding${doctor.summary.total !== 1 ? 's' : ''}`;
    const warn = doctor.summary.warning > 0
      ? `${pc.yellow(`${doctor.summary.warning} warning${doctor.summary.warning !== 1 ? 's' : ''}`)}`
      : null;
    const info = doctor.summary.info > 0
      ? `${pc.cyan(`${doctor.summary.info} info`)}`
      : null;

    const parts = [total, warn, info].filter(Boolean);
    lines.push(indent(pc.dim(`${parts.join('  ·  ')}`)));
    lines.push(indent(pc.dim('These are observations, not errors. Review at your discretion.')));
  }

  const totalTime = formatDuration(result.duration + doctor.duration);
  lines.push(indent(pc.dim(`Scanned in ${totalTime}`)));
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

// ─── Report Success Renderer ──────────────────────────────────────────────────

export function renderReportSuccess(report: GeneratedReport): void {
  const lines: string[] = [];

  lines.push('');
  lines.push(
    indent(
      `${pc.cyan(pc.bold('norix'))}  ${pc.dim('·  Report Generated  ·  v0.5.0')}`,
    ),
  );
  lines.push('');
  lines.push(rule());
  lines.push('');

  if (report.markdownPath) {
    lines.push(indent(`  ${pc.green('✓')}  ${pc.white('Markdown report')}`));
    lines.push(indent(`     ${pc.dim(report.markdownPath)}`));
    lines.push('');
  }

  if (report.jsonPath) {
    lines.push(indent(`  ${pc.green('✓')}  ${pc.white('JSON report')}`));
    lines.push(indent(`     ${pc.dim(report.jsonPath)}`));
    lines.push('');
  }

  lines.push(rule());
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}

// ─── Error / Warning helpers ──────────────────────────────────────────────────

export function renderError(message: string): void {
  process.stderr.write(`\n  ${pc.red('✖')}  ${pc.white(message)}\n\n`);
}

// ─── Private Utilities ────────────────────────────────────────────────────────

function categoryTitle(category: string): string {
  const map: Record<string, string> = {
    httpClient: 'HTTP Client',
    dateUtility: 'Date Utility',
    packageManager: 'Package Manager',
    orm: 'ORM',
  };
  return (
    map[category] ??
    category.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())
  );
}
