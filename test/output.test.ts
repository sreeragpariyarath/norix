import { describe, it, expect } from 'vitest';
import { getFormatter } from '../src/output/index.js';
import { JsonFormatter } from '../src/output/JsonFormatter.js';
import { YamlFormatter } from '../src/output/YamlFormatter.js';
import { CsvFormatter } from '../src/output/CsvFormatter.js';
import { MarkdownFormatter } from '../src/output/MarkdownFormatter.js';
import { SarifFormatter } from '../src/output/SarifFormatter.js';
import { SummaryFormatter } from '../src/output/SummaryFormatter.js';
import type { AnalysisResult } from '../src/types.js';

const mockResult: AnalysisResult = {
  repoName: 'test-repo',
  repoRoot: '/path/to/test-repo',
  isMonorepo: false,
  workspaceNames: [],
  workspaces: [],
  allPackages: new Map([
    ['react', { version: '18.2.0', isDev: false }],
    ['next', { version: '14.1.0', isDev: false }],
  ]),
  language: 'TypeScript',
  packageManager: 'npm',
  packageJsonCount: 1,
  duration: 12.34,
  capabilities: {
    framework: [
      { label: 'React', matchedPackages: ['react'], role: 'ui-library' },
      { label: 'Next.js', matchedPackages: ['next'], role: 'meta-framework' },
    ],
  },
};

describe('Formatter Factory', () => {
  it('should return correct formatter instances', () => {
    expect(getFormatter('json')).toBeInstanceOf(JsonFormatter);
    expect(getFormatter('yaml')).toBeInstanceOf(YamlFormatter);
    expect(getFormatter('csv')).toBeInstanceOf(CsvFormatter);
    expect(getFormatter('markdown')).toBeInstanceOf(MarkdownFormatter);
    expect(getFormatter('sarif')).toBeInstanceOf(SarifFormatter);
    expect(getFormatter('summary')).toBeInstanceOf(SummaryFormatter);
  });

  it('should throw on invalid format types', () => {
    expect(() => getFormatter('invalid')).toThrowError('Unsupported output format');
  });
});

describe('JsonFormatter', () => {
  it('should format output as valid JSON', () => {
    const formatter = new JsonFormatter();
    const output = formatter.format(mockResult);
    const parsed = JSON.parse(output);

    expect(parsed.$schema).toBeDefined();
    expect(parsed.repository.name).toBe('test-repo');
    expect(parsed.capabilities.framework).toHaveLength(2);
  });
});

describe('YamlFormatter', () => {
  it('should format output as a YAML string', () => {
    const formatter = new YamlFormatter();
    const output = formatter.format(mockResult);

    expect(output).toContain('name: test-repo');
    expect(output).toContain('language: TypeScript');
    expect(output).toContain('label: React');
  });
});

describe('CsvFormatter', () => {
  it('should format output as comma-separated values', () => {
    const formatter = new CsvFormatter();
    const output = formatter.format(mockResult);

    const lines = output.trim().split('\n');
    expect(lines).toHaveLength(3); // Header + 2 capabilities
    expect(lines[0]).toBe('repository,category,capability,role,matchedPackages');
    expect(lines[1]).toContain('test-repo,framework,React,ui-library,react');
  });
});

describe('MarkdownFormatter', () => {
  it('should format output as markdown', () => {
    const formatter = new MarkdownFormatter();
    const output = formatter.format(mockResult);

    expect(output).toContain('# Norix Analysis Report: test-repo');
    expect(output).toContain('| Category | Capability | Role | Matched Packages |');
    expect(output).toContain('| **framework** | React | `ui-library` | `react` |');
  });
});

describe('SarifFormatter', () => {
  it('should format output as valid SARIF', () => {
    const formatter = new SarifFormatter();
    const output = formatter.format(mockResult);
    const parsed = JSON.parse(output);

    expect(parsed.version).toBe('2.1.0');
    expect(parsed.runs[0].tool.driver.name).toBe('Norix');
    expect(parsed.runs[0].results).toHaveLength(2);
  });
});

describe('SummaryFormatter', () => {
  it('should format output as a clean text summary', () => {
    const formatter = new SummaryFormatter();
    const output = formatter.format(mockResult);

    expect(output).toContain('Repository');
    expect(output).toContain('Frontend');
    expect(output).toContain('✓ React');
    expect(output).toContain('✓ Next.js');
    expect(output).toContain('Confidence');
    expect(output).toContain('React');
    expect(output).toContain('100%');
  });
});
