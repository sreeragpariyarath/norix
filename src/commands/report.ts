/**
 * Command Handler: report
 *
 * Generates persistent Markdown and JSON report files.
 */

import { scan } from '../scanner.js';
import { analyze } from '../analyzer.js';
import { runDoctor } from '../doctor.js';
import { writeReports } from '../report.js';
import { renderReportSuccess } from '../renderer.js';
import type { ReportFormat } from '../types.js';

export async function handleReport(
  cwd: string,
  format: ReportFormat,
  outputDir: string,
  includeDoctor: boolean,
): Promise<void> {
  const scanResult = await scan(cwd);
  const analysis = analyze(scanResult);
  const doctor = includeDoctor ? runDoctor(analysis) : null;

  const report = writeReports({ format, outputDir, includeDoctor }, analysis, doctor);

  renderReportSuccess(report);
}
