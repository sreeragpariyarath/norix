/**
 * Command Handler: doctor
 *
 * Runs rules engine to detect capability overlaps and health findings.
 */

import { scan } from '../scanner.js';
import { analyze } from '../analyzer.js';
import { runDoctor } from '../doctor.js';
import { renderDoctor } from '../renderer.js';
import type { AnalysisResult, DoctorResult } from '../types.js';

function toJson(analysis: AnalysisResult, doctor: DoctorResult, version: string): unknown {
  return {
    $schema: 'https://norix.dev/schemas/doctor/v1.json',
    version: '1',
    norixVersion: version,
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

export async function handleDoctor(
  cwd: string,
  asJson: boolean,
  severity: string,
  version: string,
): Promise<void> {
  const scanResult = await scan(cwd);
  const analysis = analyze(scanResult);
  const doctor = runDoctor(analysis);

  // Filter findings by severity
  const filteredFindings =
    severity === 'all' ? doctor.findings : doctor.findings.filter((f) => f.severity === severity);

  const filteredDoctor: DoctorResult = {
    ...doctor,
    findings: filteredFindings,
    summary: {
      total: filteredFindings.length,
      warning: filteredFindings.filter((f) => f.severity === 'warning').length,
      info: filteredFindings.filter((f) => f.severity === 'info').length,
    },
  };

  if (asJson) {
    process.stdout.write(JSON.stringify(toJson(analysis, filteredDoctor, version), null, 2) + '\n');
  } else {
    renderDoctor(analysis, filteredDoctor);
  }
}
