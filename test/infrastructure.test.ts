import { describe, it, expect } from 'vitest';
import { DockerDetector } from '../src/engine/detectors/DockerDetector.js';
import { DockerComposeDetector } from '../src/engine/detectors/DockerComposeDetector.js';
import { KubernetesDetector } from '../src/engine/detectors/KubernetesDetector.js';
import { HelmDetector } from '../src/engine/detectors/HelmDetector.js';
import { TurboRepoDetector } from '../src/engine/detectors/TurboRepoDetector.js';
import { NxDetector } from '../src/engine/detectors/NxDetector.js';
import { LernaDetector } from '../src/engine/detectors/LernaDetector.js';
import { NpmDetector } from '../src/engine/detectors/NpmDetector.js';
import { PnpmDetector } from '../src/engine/detectors/PnpmDetector.js';
import { YarnDetector } from '../src/engine/detectors/YarnDetector.js';
import { BunDetector } from '../src/engine/detectors/BunDetector.js';
import { GitHubActionsDetector } from '../src/engine/detectors/GitHubActionsDetector.js';
import { GitLabCIDetector } from '../src/engine/detectors/GitLabCIDetector.js';
import { CircleCIDetector } from '../src/engine/detectors/CircleCIDetector.js';
import { AzurePipelinesDetector } from '../src/engine/detectors/AzurePipelinesDetector.js';
import { VercelDetector } from '../src/engine/detectors/VercelDetector.js';
import { NetlifyDetector } from '../src/engine/detectors/NetlifyDetector.js';
import { RailwayDetector } from '../src/engine/detectors/RailwayDetector.js';
import { RenderDetector } from '../src/engine/detectors/RenderDetector.js';
import { CloudflareWorkersDetector } from '../src/engine/detectors/CloudflareWorkersDetector.js';
import { EvidenceContext } from '../src/engine/context/EvidenceContext.js';
import { NodePackageReader } from '../src/engine/context/readers/NodePackageReader.js';
import { WorkspaceReader } from '../src/engine/context/readers/WorkspaceReader.js';
import { EnvReader } from '../src/engine/context/readers/EnvReader.js';
import { ConfigReader, DockerComposeManifest } from '../src/engine/context/readers/ConfigReader.js';
import { FileReader } from '../src/engine/context/readers/FileReader.js';
import { DetectorRegistry } from '../src/engine/registry/DetectorRegistry.js';

function createMockContext(options: {
  packages?: string[];
  versionMap?: Record<string, string>;
  files?: string[];
  composeManifest?: DockerComposeManifest;
}): EvidenceContext {
  const fileSet = new Set(options.files || []);

  const nodeReader: NodePackageReader = {
    hasPackage: (name) => !!options.packages?.includes(name),
    getPackageVersion: (name) => options.versionMap?.[name] || null,
    getPackageJson: async () => null,
  };

  const fileReader: FileReader = {
    hasFile: (path) => fileSet.has(path),
    getFileContent: async (path) => (fileSet.has(path) ? 'mock content' : null),
    getFileContentSync: (path) => (fileSet.has(path) ? 'mock content' : null),
    searchInFile: async () => false,
  };

  const configReader: ConfigReader = {
    getDockerCompose: async () => options.composeManifest || null,
    searchInConfig: async () => false,
  };

  return {
    repoRoot: '/dummy',
    node: nodeReader,
    workspace: {} as unknown as WorkspaceReader,
    env: {} as unknown as EnvReader,
    configs: configReader,
    fileSystem: fileReader,
  };
}

describe('DockerDetector', () => {
  const detector = new DockerDetector();

  it('should compile evidence when Dockerfile is present', async () => {
    const context = createMockContext({
      files: ['Dockerfile', '.dockerignore'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
  });
});

describe('DockerComposeDetector', () => {
  const detector = new DockerComposeDetector();

  it('should compile evidence and extract version when compose file exists', async () => {
    const context = createMockContext({
      files: ['docker-compose.yml'],
      composeManifest: { version: '3.8', services: {} },
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
    expect(version).toBe('3.8');
  });
});

describe('KubernetesDetector', () => {
  const detector = new KubernetesDetector();

  it('should compile evidence when k8s folder is present', async () => {
    const context = createMockContext({
      files: ['k8s'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });
});

describe('HelmDetector', () => {
  const detector = new HelmDetector();

  it('should compile evidence when Chart.yaml is present', async () => {
    const context = createMockContext({
      files: ['Chart.yaml', 'values.yaml'],
    });

    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
  });
});

describe('TurboRepoDetector', () => {
  const detector = new TurboRepoDetector();

  it('should compile evidence when turbo dependency is present', async () => {
    const context = createMockContext({
      packages: ['turbo'],
      versionMap: { turbo: '1.10.1' },
      files: ['turbo.json'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(version).toBe('1.10.1');
  });
});

describe('NxDetector', () => {
  const detector = new NxDetector();

  it('should compile evidence when nx dependency is present', async () => {
    const context = createMockContext({
      packages: ['nx'],
      versionMap: { nx: '16.5.0' },
      files: ['nx.json'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(version).toBe('16.5.0');
  });
});

describe('LernaDetector', () => {
  const detector = new LernaDetector();

  it('should compile evidence when lerna is present', async () => {
    const context = createMockContext({
      packages: ['lerna'],
      versionMap: { lerna: '7.1.0' },
      files: ['lerna.json'],
    });

    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(version).toBe('7.1.0');
  });
});

describe('Package Managers (npm, pnpm, Yarn, Bun)', () => {
  it('should compile evidence for npm', async () => {
    const detector = new NpmDetector();
    const context = createMockContext({ files: ['package-lock.json'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for pnpm', async () => {
    const detector = new PnpmDetector();
    const context = createMockContext({ files: ['pnpm-lock.yaml', 'pnpm-workspace.yaml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
  });

  it('should compile evidence for Yarn', async () => {
    const detector = new YarnDetector();
    const context = createMockContext({ files: ['yarn.lock'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for Bun', async () => {
    const detector = new BunDetector();
    const context = createMockContext({ files: ['bun.lockb'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });
});

describe('CI/CD (GitHub, GitLab, CircleCI, Azure)', () => {
  it('should compile evidence for GitHub Actions', async () => {
    const detector = new GitHubActionsDetector();
    const context = createMockContext({ files: ['.github/workflows'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for GitLab CI', async () => {
    const detector = new GitLabCIDetector();
    const context = createMockContext({ files: ['.gitlab-ci.yml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for CircleCI', async () => {
    const detector = new CircleCIDetector();
    const context = createMockContext({ files: ['.circleci/config.yml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for Azure Pipelines', async () => {
    const detector = new AzurePipelinesDetector();
    const context = createMockContext({ files: ['azure-pipelines.yml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });
});

describe('Cloud (Vercel, Netlify, Railway, Render, Cloudflare Workers)', () => {
  it('should compile evidence for Vercel', async () => {
    const detector = new VercelDetector();
    const context = createMockContext({ files: ['vercel.json', '.vercel'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
  });

  it('should compile evidence for Netlify', async () => {
    const detector = new NetlifyDetector();
    const context = createMockContext({ files: ['netlify.toml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for Railway', async () => {
    const detector = new RailwayDetector();
    const context = createMockContext({ files: ['railway.json'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for Render', async () => {
    const detector = new RenderDetector();
    const context = createMockContext({ files: ['render.yaml'] });
    const { evidence } = await detector.detect(context);
    expect(evidence).toHaveLength(1);
  });

  it('should compile evidence for Cloudflare Workers', async () => {
    const detector = new CloudflareWorkersDetector();
    const context = createMockContext({
      packages: ['@cloudflare/workers-types'],
      versionMap: { '@cloudflare/workers-types': '4.20230518.0' },
      files: ['wrangler.toml'],
    });
    const { evidence, version } = await detector.detect(context);
    expect(evidence).toHaveLength(2);
    expect(version).toBe('4.20230518.0');
  });
});

describe('Infrastructure Integration via Registry', () => {
  it('should execute pipeline correctly and resolve docker and vercel configs', async () => {
    const registry = new DetectorRegistry();
    registry.add([new DockerDetector(), new VercelDetector()]);

    const context = createMockContext({
      files: ['Dockerfile', 'vercel.json'],
    });

    const results = await registry.execute(context);
    expect(results).toHaveLength(2);

    expect(results[0].detectorId).toBe('docker');
    expect(results[0].matched).toBe(true);

    expect(results[1].detectorId).toBe('vercel');
    expect(results[1].matched).toBe(true);
  });
});
