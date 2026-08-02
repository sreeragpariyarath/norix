import { OutputFormatter } from './OutputFormatter.js';
import { AnalysisResult } from '../types.js';

function stringifyYaml(val: unknown, indent = 0): string {
  const spaces = ' '.repeat(indent);
  if (val === null || val === undefined) {
    return 'null';
  }
  if (typeof val === 'string') {
    if (val.includes(':') || val.includes('\n') || val.includes('[') || val.includes(']')) {
      return JSON.stringify(val);
    }
    return val;
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return String(val);
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (val instanceof Map) {
    if (val.size === 0) return '{}';
    let res = '\n';
    for (const [key, value] of val.entries()) {
      res += `${spaces}${key}: ${stringifyYaml(value, indent + 2)}\n`;
    }
    return res.trimEnd();
  }
  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    let res = '';
    for (const item of val) {
      res += `\n${spaces}- ${stringifyYaml(item, indent + 2)}`;
    }
    return res;
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const keys = Object.keys(obj);
    if (keys.length === 0) return '{}';
    let res = '';
    for (const key of keys) {
      const value = obj[key];
      res += `\n${spaces}${key}: ${stringifyYaml(value, indent + 2)}`;
    }
    return res.trimEnd();
  }
  return '';
}

/**
 * Output formatter that produces clean YAML report strings.
 */
export class YamlFormatter implements OutputFormatter {
  format(result: AnalysisResult): string {
    const data = {
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
    return stringifyYaml(data).trim() + '\n';
  }
}
