/**
 * A lightweight, dependency-free utility to record and summarize execution timing phases.
 */
export class Profiler {
  private startTime: number = 0;
  private endTime: number = 0;
  private laps: Map<string, { start: number; total: number }> = new Map();
  private currentLap: string | null = null;

  /**
   * Resets and starts the global timer.
   */
  start(): void {
    this.startTime = performance.now();
    this.endTime = 0;
    this.laps.clear();
    this.currentLap = null;
  }

  /**
   * Stops the global timer and stops the active lap if one exists.
   */
  stop(): void {
    this.endTime = performance.now();
    if (this.currentLap) {
      const lapData = this.laps.get(this.currentLap);
      if (lapData) {
        lapData.total += this.endTime - lapData.start;
      }
      this.currentLap = null;
    }
  }

  /**
   * Completes the current lap and starts a new lap with the specified name.
   * If a lap of the same name was run previously, the duration accumulates.
   *
   * @param name Name of the timing lap (e.g. 'scan')
   */
  lap(name: string): void {
    const now = performance.now();
    if (this.currentLap) {
      const lapData = this.laps.get(this.currentLap);
      if (lapData) {
        lapData.total += now - lapData.start;
      }
    }
    this.currentLap = name;
    if (!this.laps.has(name)) {
      this.laps.set(name, { start: now, total: 0 });
    } else {
      const lapData = this.laps.get(name)!;
      lapData.start = now;
    }
  }

  /**
   * Returns the elapsed total time and list of all lap durations.
   * If stop() was not called, uses the current time to compute open laps.
   */
  summary(): { total: number; laps: Record<string, number> } {
    const total =
      this.endTime > 0 ? this.endTime - this.startTime : performance.now() - this.startTime;
    const lapsRecord: Record<string, number> = {};

    for (const [name, data] of this.laps.entries()) {
      let duration = data.total;
      if (this.currentLap === name && this.endTime === 0) {
        duration += performance.now() - data.start;
      }
      lapsRecord[name] = duration;
    }

    return {
      total,
      laps: lapsRecord,
    };
  }
}
