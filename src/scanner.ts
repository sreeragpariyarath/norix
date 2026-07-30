/**
 * Repository Scanner
 *
 * Reads the file system to produce a ScanResult:
 *  1. Reads root package.json
 *  2. Detects package manager from lock files
 *  3. Detects monorepo workspace configuration
 *  4. Resolves and reads all workspace package.json files
 *  5. Collects all installed packages (deps + devDeps) across the repo
 *
 * This module is intentionally read-only and makes zero network requests.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import type { PackageJsonFile, ScanResult, WorkspaceInfo } from './types.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readJson<T>(filePath: string): T | null {
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as T;
  } catch {
    return null;
  }
}

function mergePackages(
  into: Map<string, { version: string; isDev: boolean }>,
  pkg: PackageJsonFile,
): void {
  const deps = [
    ...Object.entries(pkg.dependencies ?? {}),
    ...Object.entries(pkg.devDependencies ?? {}).map(
      ([k, v]) => [k, v] as [string, string],
    ),
  ];
  for (const [name, version] of deps) {
    if (!into.has(name)) {
      into.set(name, {
        version,
        isDev: name in (pkg.devDependencies ?? {}),
      });
    }
  }
}

// ─── Package Manager Detection ────────────────────────────────────────────────

function detectPackageManager(root: string): string {
  if (existsSync(join(root, 'bun.lockb'))) return 'bun';
  if (existsSync(join(root, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(root, 'yarn.lock'))) return 'yarn';
  if (existsSync(join(root, 'package-lock.json'))) return 'npm';
  return 'unknown';
}

// ─── Language Detection ───────────────────────────────────────────────────────

function detectLanguage(
  root: string,
  allPackages: Map<string, { version: string; isDev: boolean }>,
): string {
  if (
    existsSync(join(root, 'tsconfig.json')) ||
    allPackages.has('typescript') ||
    allPackages.has('@types/node')
  ) {
    return 'TypeScript';
  }
  return 'JavaScript';
}

// ─── Path Safety ──────────────────────────────────────────────────────────────

/**
 * Guarantees that `targetPath` strictly resides inside `resolvedRoot`.
 *
 * Uses `node:path` relative calculation: returns `true` if and only if the path
 * from `resolvedRoot` to `targetPath` does not start with `..` and is not absolute.
 *
 * @param resolvedRoot Pre-resolved, absolute path to the repository root.
 * @param targetPath Path to test for root boundary containment.
 */
function isPathWithinRoot(resolvedRoot: string, targetPath: string): boolean {
  const resolvedTarget = resolve(targetPath);
  const rel = relative(resolvedRoot, resolvedTarget);
  return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

// ─── Workspace Resolution ─────────────────────────────────────────────────────

/**
 * Resolves workspace glob patterns (e.g. "packages/*") to package.json paths.
 * Handles simple /* globs and direct paths — covers 95% of real-world usage
 * without requiring an external globbing library.
 *
 * Enforces strict root boundaries using `isPathWithinRoot()` to prevent path
 * traversal outside the repository.
 */
function resolveWorkspacePatterns(root: string, patterns: string[]): string[] {
  const results: string[] = [];
  const resolvedRoot = resolve(root);

  for (const rawPattern of patterns) {
    if (typeof rawPattern !== 'string') continue;
    const pattern = rawPattern.trim();
    if (!pattern) continue;

    if (pattern.endsWith('/*') || pattern.endsWith('/**')) {
      // e.g. "packages/*" → scan all subdirectories of packages/
      const dir = pattern.replace(/\/\*+$/, '');
      const fullDir = join(resolvedRoot, dir);

      if (!isPathWithinRoot(resolvedRoot, fullDir) || !existsSync(fullDir)) {
        continue;
      }

      try {
        const entries = readdirSync(fullDir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            const pkgPath = join(fullDir, entry.name, 'package.json');
            if (isPathWithinRoot(resolvedRoot, pkgPath) && existsSync(pkgPath)) {
              results.push(pkgPath);
            }
          }
        }
      } catch {
        // Skip unreadable directories gracefully
      }
    } else {
      // Direct path — e.g. "packages/ui"
      const pkgPath = join(resolvedRoot, pattern, 'package.json');
      if (isPathWithinRoot(resolvedRoot, pkgPath) && existsSync(pkgPath)) {
        results.push(pkgPath);
      }
    }
  }

  return results;
}

/**
 * Minimal pnpm-workspace.yaml parser.
 * Reads only the `packages:` array — no full YAML dependency needed.
 *
 * Handles format:
 *   packages:
 *     - 'packages/*'
 *     - apps/*
 */
function parsePnpmWorkspaceYaml(root: string): string[] | null {
  const filePath = join(root, 'pnpm-workspace.yaml');
  if (!existsSync(filePath)) return null;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const patterns: string[] = [];
    let inPackages = false;

    for (const rawLine of content.split('\n')) {
      const line = rawLine.trim();

      if (line === 'packages:') {
        inPackages = true;
        continue;
      }

      if (inPackages) {
        if (line.startsWith('-')) {
          // Strip leading "- " and surrounding quotes
          const pattern = line
            .slice(1)
            .trim()
            .replace(/^['"]|['"]$/g, '');
          if (pattern) patterns.push(pattern);
        } else if (line.length > 0 && !line.startsWith('#')) {
          // Hit another top-level key — stop
          inPackages = false;
        }
      }
    }

    return patterns.length > 0 ? patterns : null;
  } catch {
    return null;
  }
}

function extractPackageMap(
  pkg: PackageJsonFile,
): Map<string, { version: string; isDev: boolean }> {
  const map = new Map<string, { version: string; isDev: boolean }>();
  mergePackages(map, pkg);
  return map;
}

// ─── Main Scanner ─────────────────────────────────────────────────────────────

export async function scan(root: string): Promise<ScanResult> {
  const start = performance.now();
  const resolvedRoot = resolve(root);

  // 1. Validate root has a package.json
  const rootPkgPath = join(resolvedRoot, 'package.json');
  if (!existsSync(rootPkgPath)) {
    throw new Error(
      `No package.json found in ${root}\n  Make sure you are inside a Node.js repository.`,
    );
  }

  const rootPkg = readJson<PackageJsonFile>(rootPkgPath);
  if (!rootPkg) {
    throw new Error(`Could not parse ${rootPkgPath}`);
  }

  // 2. Collect packages from root
  const allPackages = new Map<string, { version: string; isDev: boolean }>();
  mergePackages(allPackages, rootPkg);

  let isMonorepo = false;
  const workspaceNames: string[] = [];
  const workspaces: WorkspaceInfo[] = [];
  let packageJsonCount = 1;

  // Add primary root workspace entry
  workspaces.push({
    name: rootPkg.name ?? basename(resolvedRoot),
    relativePath: '.',
    packages: extractPackageMap(rootPkg),
  });

  // 3. Detect workspace configuration
  let workspacePatterns: string[] | null = null;

  // Priority 1: pnpm-workspace.yaml
  workspacePatterns = parsePnpmWorkspaceYaml(resolvedRoot);

  // Priority 2: package.json workspaces field (npm/yarn)
  if (!workspacePatterns && rootPkg.workspaces) {
    workspacePatterns = Array.isArray(rootPkg.workspaces)
      ? rootPkg.workspaces
      : rootPkg.workspaces.packages;
  }

  // Priority 3: turbo.json / nx.json presence (monorepo without workspace config)
  if (!workspacePatterns) {
    if (
      existsSync(join(resolvedRoot, 'turbo.json')) ||
      existsSync(join(resolvedRoot, 'nx.json')) ||
      existsSync(join(resolvedRoot, 'lerna.json'))
    ) {
      isMonorepo = true;
    }
  }

  // 4. If workspace patterns found, scan all workspace packages
  if (workspacePatterns && workspacePatterns.length > 0) {
    isMonorepo = true;
    const workspacePkgPaths = resolveWorkspacePatterns(resolvedRoot, workspacePatterns);

    for (const pkgPath of workspacePkgPaths) {
      const pkg = readJson<PackageJsonFile>(pkgPath);
      if (!pkg) continue;
      packageJsonCount++;
      const dirPath = dirname(pkgPath);
      const wsName = pkg.name ?? basename(dirPath);
      if (pkg.name) workspaceNames.push(pkg.name);

      workspaces.push({
        name: wsName,
        relativePath: relative(resolvedRoot, dirPath),
        packages: extractPackageMap(pkg),
      });

      mergePackages(allPackages, pkg);
    }
  }

  // 5. Detect environment
  const packageManager = detectPackageManager(resolvedRoot);
  const language = detectLanguage(resolvedRoot, allPackages);
  const repoName = rootPkg.name ?? basename(resolvedRoot);
  const duration = performance.now() - start;

  return {
    repoName,
    repoRoot: resolvedRoot,
    isMonorepo,
    workspaceNames,
    workspaces,
    allPackages,
    language,
    packageManager,
    packageJsonCount,
    duration,
  };
}
