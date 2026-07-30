/**
 * Doctor Engine
 *
 * Runs rules against an AnalysisResult to detect capability overlaps.
 *
 * Key design: overlaps are detected by ROLE, not by category.
 *
 *   jest (role: test-runner) + supertest (role: http-assertion) → NOT flagged
 *   jest (role: test-runner) + vitest (role: test-runner)       → flagged ✓
 *   morgan (role: http-middleware) + winston (role: app-logger)  → NOT flagged
 *   winston (role: app-logger) + pino (role: app-logger)         → flagged ✓
 *
 * Design principles:
 *  - Never say something is "wrong" — report "Potential Capability Overlap"
 *  - Always include evidence (the packages that triggered it)
 *  - Always include reasoning (human-readable explanation)
 *  - Two severity levels: "warning" and "info"
 *  - Doctor exit code is always 0 — findings are not failures
 */

import type {
  AnalysisResult,
  CapabilityCategory,
  CapabilityMatch,
  DoctorFinding,
  DoctorResult,
  FindingSeverity,
} from './types.js';

// ─── Rule Definitions ─────────────────────────────────────────────────────────

/**
 * Each rule defines a category to monitor.
 * When 2+ matches with the SAME role are found in that category,
 * a finding is generated using this rule's severity and reasoning.
 */
interface OverlapRule {
  category: CapabilityCategory;
  severity: FindingSeverity;
  minMatches?: number;
  reasoning: string;
}

const OVERLAP_RULES: OverlapRule[] = [
  {
    category: 'framework',
    severity: 'warning',
    reasoning:
      'Multiple libraries serving the same framework role were detected. ' +
      'In a monorepo this is expected across different apps, but within a single ' +
      'package it may indicate an incomplete migration or an unintentional dependency.',
  },
  {
    category: 'orm',
    severity: 'warning',
    reasoning:
      'Multiple ORM libraries of the same type suggest different layers are using ' +
      'different data access patterns. This can cause inconsistencies in query style, ' +
      'migration management, and connection pooling.',
  },
  {
    category: 'validation',
    severity: 'warning',
    reasoning:
      'Multiple validation libraries can produce inconsistent error formats, ' +
      'making it harder to handle validation errors uniformly. ' +
      'Standardizing on one simplifies error handling middleware and type inference.',
  },
  {
    category: 'authentication',
    severity: 'warning',
    reasoning:
      'Multiple authentication libraries of the same type may indicate competing ' +
      'session management strategies. This can create security blind spots if ' +
      'session invalidation or token revocation is not handled consistently everywhere.',
  },
  {
    category: 'httpClient',
    severity: 'warning',
    reasoning:
      'Multiple HTTP client libraries lead to inconsistent error handling, ' +
      'request interceptor patterns, and retry logic. ' +
      'Consolidating to one makes the codebase more predictable and easier to maintain.',
  },
  {
    category: 'dateUtility',
    severity: 'info',
    reasoning:
      'Multiple date libraries are common when different parts of the codebase ' +
      'have legacy choices. Standardizing on one reduces bundle size ' +
      'and improves consistency in date formatting and timezone handling.',
  },
  {
    category: 'logging',
    severity: 'info',
    reasoning:
      'Multiple app-level logging libraries detected. ' +
      'Consolidating to one simplifies log aggregation, structured logging configuration, ' +
      'and log level management across the application.',
  },
  {
    category: 'testing',
    severity: 'info',
    reasoning:
      'Multiple test runners detected. This is common during migrations (e.g. Jest → Vitest). ' +
      'If the migration is complete, removing the old runner reduces dependency overhead ' +
      'and simplifies CI configuration.',
  },
  {
    category: 'cache',
    severity: 'info',
    reasoning:
      'Multiple caching libraries of the same type detected. ' +
      'Review whether both are actively used, or if the codebase can be consolidated ' +
      'to a single caching strategy.',
  },
  {
    category: 'queue',
    severity: 'info',
    reasoning:
      'Multiple queue libraries of the same type detected. ' +
      'Different queue backends (Redis, Postgres, message brokers) can coexist legitimately, ' +
      'but duplicate libraries within the same backend type are worth reviewing.',
  },
  {
    category: 'email',
    severity: 'info',
    reasoning:
      'Multiple email sending services detected. ' +
      'Review whether both are actively used for different purposes, ' +
      'or if one can be consolidated.',
  },
  {
    category: 'build',
    severity: 'info',
    reasoning:
      'Multiple bundlers of the same type detected. ' +
      'This may indicate a partially completed migration between build tools.',
  },
];

// ─── Doctor Engine ────────────────────────────────────────────────────────────

function roleToHumanLabel(role: string): string {
  return role
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function buildFinding(
  rule: OverlapRule,
  role: string,
  roleMatches: CapabilityMatch[],
): DoctorFinding {
  const roleLabel = roleToHumanLabel(role);
  const names = roleMatches.map((m) => m.label).join(', ');

  return {
    id: `capability-overlap/${rule.category}/${role}`,
    title: `Potential Capability Overlap: ${roleLabel} (${names})`,
    severity: rule.severity,
    category: rule.category,
    evidence: roleMatches.flatMap((m) =>
      m.matchedPackages.map((pkg) => ({ package: pkg })),
    ),
    reasoning: rule.reasoning,
  };
}

export function runDoctor(analysis: AnalysisResult): DoctorResult {
  const start = performance.now();
  const findings: DoctorFinding[] = [];

  for (const rule of OVERLAP_RULES) {
    const matches = analysis.capabilities[rule.category];
    if (!matches || matches.length < 2) continue;

    // Group matches by role within this category
    const byRole = new Map<string, CapabilityMatch[]>();
    for (const match of matches) {
      const group = byRole.get(match.role) ?? [];
      group.push(match);
      byRole.set(match.role, group);
    }

    // Only flag when 2+ matches share the SAME role (= competing tools)
    for (const [role, roleMatches] of byRole.entries()) {
      if (roleMatches.length >= (rule.minMatches ?? 2)) {
        findings.push(buildFinding(rule, role, roleMatches));
      }
    }
  }

  const warnings = findings.filter((f) => f.severity === 'warning').length;

  return {
    findings,
    summary: {
      total: findings.length,
      warning: warnings,
      info: findings.length - warnings,
    },
    duration: performance.now() - start,
  };
}
