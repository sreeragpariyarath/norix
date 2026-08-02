import { Detector } from '../../../src/engine/types/Detector.js';
import { CapabilityCategory } from '../../../src/engine/types/Capability.js';
import { Evidence, EvidenceType, EvidenceSourceType } from '../../../src/engine/types/Evidence.js';
import { EvidenceContext } from '../../../src/engine/context/EvidenceContext.js';

export class FlutterDetector implements Detector {
  readonly id = 'flutter';
  readonly label = 'Flutter';
  readonly category = CapabilityCategory.Framework;
  readonly role = 'cross-platform-framework';

  async detect(context: EvidenceContext): Promise<{ evidence: Evidence[]; version?: string }> {
    const hasPubspec = context.fileSystem.hasFile('pubspec.yaml');
    if (!hasPubspec) {
      return { evidence: [] };
    }

    const content = await context.fileSystem.getFileContent('pubspec.yaml');
    if (!content) {
      return { evidence: [] };
    }

    const isFlutter = content.includes('sdk: flutter') || content.includes('flutter:');
    if (isFlutter) {
      return {
        evidence: [
          {
            type: EvidenceType.FilePresence,
            source: { type: EvidenceSourceType.Manifest, name: 'pubspec.yaml' },
            file: 'pubspec.yaml',
            weight: 1.0,
            message: 'Detected Flutter dependency in pubspec.yaml',
          },
        ],
        version: 'unknown',
      };
    }

    return { evidence: [] };
  }
}
