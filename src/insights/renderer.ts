/**
 * Insights Renderer
 *
 * Renders an ArchitectureReport to the terminal.
 * Follows the same style conventions as src/renderer.ts:
 *  - picocolors for color
 *  - indent() / rule() / row() helpers
 *  - Single runtime dependency: picocolors
 */

import pc from 'picocolors';
import type { ArchitectureReport, Recommendation } from './types.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_RULE_WIDTH = 52;
const DEFAULT_LABEL_WIDTH = 16;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function indent(content = ''): string {
  return `  ${content}`;
}

function padRight(str: string, len: number): string {
  return str + ' '.repeat(Math.max(0, len - str.length));
}

function rule(width = DEFAULT_RULE_WIDTH): string {
  return indent(pc.dim('─'.repeat(width)));
}

function row(label: string, value: string, labelWidth = DEFAULT_LABEL_WIDTH): string {
  return indent(`${pc.dim(padRight(label, labelWidth))} ${value}`);
}

function sectionHeader(title: string): string {
  return indent(pc.bold(pc.white(title)));
}

function priorityColor(priority: Recommendation['priority'], text: string): string {
  switch (priority) {
    case 'high':
      return pc.red(text);
    case 'medium':
      return pc.yellow(text);
    case 'low':
      return pc.cyan(text);
  }
}

// ─── Main Renderer ────────────────────────────────────────────────────────────

/**
 * Renders a full ArchitectureReport to stdout using terminal colors.
 */
export function renderInsights(report: ArchitectureReport): void {
  const lines: string[] = [];
  const { summary, frontend, backend, database, infrastructure, monorepo } = report;

  // ── Header ──────────────────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    indent(
      `${pc.cyan(pc.bold('norix'))}  ${pc.dim('·  Project Insights  ·  ' + report.metadata.norixVersion)}`,
    ),
  );
  lines.push('');
  lines.push(rule());

  // ── Project Summary ─────────────────────────────────────────────────────────
  lines.push('');
  lines.push(sectionHeader('Project Summary'));
  lines.push('');
  lines.push(row('Archetype', pc.bold(pc.white(summary.archetype))));
  lines.push(row('Language', pc.white(summary.primaryLanguage)));
  lines.push(row('Package Mgr', pc.white(summary.packageManager)));
  lines.push(row('Repository', pc.white(summary.repoName)));
  if (summary.isMonorepo) {
    lines.push(row('Type', pc.white('Monorepo')));
  }
  lines.push('');
  lines.push(rule());

  // ── Frontend ────────────────────────────────────────────────────────────────
  const hasFrontend =
    frontend.metaFramework !== undefined ||
    frontend.uiLibrary !== undefined ||
    frontend.bundler !== undefined;

  if (hasFrontend || frontend.hasTypeScript) {
    lines.push('');
    lines.push(sectionHeader('Frontend'));
    lines.push('');
    if (frontend.metaFramework !== undefined) {
      lines.push(row('Meta-framework', pc.white(frontend.metaFramework)));
    }
    if (frontend.uiLibrary !== undefined) {
      lines.push(row('UI Library', pc.white(frontend.uiLibrary)));
    }
    if (frontend.bundler !== undefined) {
      lines.push(row('Bundler', pc.white(frontend.bundler)));
    }
    if (frontend.styling.length > 0) {
      lines.push(row('Styling', pc.white(frontend.styling.join(', '))));
    }
    lines.push(row('TypeScript', frontend.hasTypeScript ? pc.green('Yes') : pc.dim('No')));
    lines.push('');
    lines.push(rule());
  }

  // ── Backend ─────────────────────────────────────────────────────────────────
  const hasBackend =
    backend.frameworks.length > 0 ||
    backend.apiLayer.length > 0 ||
    backend.authentication.length > 0 ||
    backend.validation.length > 0;

  if (hasBackend) {
    lines.push('');
    lines.push(sectionHeader('Backend'));
    lines.push('');
    if (backend.frameworks.length > 0) {
      lines.push(row('Framework', pc.white(backend.frameworks.join(', '))));
    }
    if (backend.apiLayer.length > 0) {
      lines.push(row('API Layer', pc.white(backend.apiLayer.join(', '))));
    }
    if (backend.authentication.length > 0) {
      lines.push(row('Auth', pc.white(backend.authentication.join(', '))));
    }
    if (backend.validation.length > 0) {
      lines.push(row('Validation', pc.white(backend.validation.join(', '))));
    }
    if (backend.cache.length > 0) {
      lines.push(row('Cache', pc.white(backend.cache.join(', '))));
    }
    if (backend.queue.length > 0) {
      lines.push(row('Queue', pc.white(backend.queue.join(', '))));
    }
    lines.push('');
    lines.push(rule());
  }

  // ── Database ────────────────────────────────────────────────────────────────
  const hasDb =
    database.drivers.length > 0 || database.orms.length > 0 || database.managedServices.length > 0;

  if (hasDb) {
    lines.push('');
    lines.push(sectionHeader('Database'));
    lines.push('');
    if (database.drivers.length > 0) {
      lines.push(row('Driver', pc.white(database.drivers.join(', '))));
    }
    if (database.orms.length > 0) {
      lines.push(row('ORM / QB', pc.white(database.orms.join(', '))));
    }
    if (database.managedServices.length > 0) {
      lines.push(row('Managed', pc.white(database.managedServices.join(', '))));
    }
    const dbType = [database.isRelational && 'Relational', database.isDocument && 'Document']
      .filter(Boolean)
      .join(' + ');
    if (dbType.length > 0) {
      lines.push(row('Type', pc.white(dbType)));
    }
    lines.push('');
    lines.push(rule());
  }

  // ── Infrastructure ──────────────────────────────────────────────────────────
  const hasInfra =
    infrastructure.ciCd.length > 0 ||
    infrastructure.deployment.length > 0 ||
    infrastructure.containerization.length > 0 ||
    infrastructure.monitoring.length > 0;

  if (hasInfra) {
    lines.push('');
    lines.push(sectionHeader('Infrastructure'));
    lines.push('');
    if (infrastructure.ciCd.length > 0) {
      lines.push(row('CI/CD', pc.white(infrastructure.ciCd.join(', '))));
    }
    if (infrastructure.deployment.length > 0) {
      lines.push(row('Deployment', pc.white(infrastructure.deployment.join(', '))));
    }
    if (infrastructure.containerization.length > 0) {
      lines.push(row('Containers', pc.white(infrastructure.containerization.join(', '))));
    }
    if (infrastructure.monitoring.length > 0) {
      lines.push(row('Monitoring', pc.white(infrastructure.monitoring.join(', '))));
    }
    lines.push('');
    lines.push(rule());
  }

  // ── Monorepo ────────────────────────────────────────────────────────────────
  if (monorepo !== undefined) {
    lines.push('');
    lines.push(sectionHeader('Monorepo'));
    lines.push('');
    lines.push(row('Tool', pc.white(monorepo.tool)));
    lines.push(row('Workspaces', pc.white(String(monorepo.workspaceCount))));
    lines.push('');
    lines.push(rule());
  }

  // ── Strengths ───────────────────────────────────────────────────────────────
  if (report.strengths.length > 0) {
    lines.push('');
    lines.push(indent(`${pc.green('✦')}  ${pc.bold(pc.white('Strengths'))}`));
    lines.push('');
    for (const s of report.strengths) {
      lines.push(indent(`  ${pc.green('✓')}  ${pc.white(s.title)}`));
      lines.push(indent(`       ${pc.dim(s.detail)}`));
    }
    lines.push('');
    lines.push(rule());
  }

  // ── Risks ───────────────────────────────────────────────────────────────────
  if (report.risks.length > 0) {
    lines.push('');
    lines.push(indent(`${pc.yellow('⚠')}  ${pc.bold(pc.white('Risks'))}`));
    lines.push('');
    for (const r of report.risks) {
      lines.push(indent(`  ${pc.yellow('⚠')}  ${pc.white(r.title)}`));
      lines.push(indent(`       ${pc.dim(r.detail)}`));
    }
    lines.push('');
    lines.push(rule());
  }

  // ── Recommendations ─────────────────────────────────────────────────────────
  if (report.recommendations.length > 0) {
    lines.push('');
    lines.push(indent(`${pc.cyan('◆')}  ${pc.bold(pc.white('Recommendations'))}`));
    lines.push('');
    for (const rec of report.recommendations) {
      const badge = priorityColor(rec.priority, `[${rec.priority}]`);
      lines.push(indent(`  ${badge}  ${pc.white(rec.title)}`));
      lines.push(indent(`         ${pc.dim(rec.detail)}`));
      lines.push('');
    }
    lines.push(rule());
  }

  // ── Footer ──────────────────────────────────────────────────────────────────
  lines.push('');
  lines.push(
    indent(
      pc.dim(
        `${summary.detectedCapabilityCount} capabilities detected  ·  modern engine  ·  ${report.metadata.generatedAt.split('T')[0]}`,
      ),
    ),
  );
  lines.push('');

  process.stdout.write(lines.join('\n') + '\n');
}
