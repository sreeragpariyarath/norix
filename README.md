# norix

Repository Analysis CLI — understand your codebase instantly.

[![npm version](https://img.shields.io/npm/v/norix-cli.svg)](https://www.npmjs.com/package/norix-cli)
[![npm downloads](https://img.shields.io/npm/dm/norix-cli.svg)](https://www.npmjs.com/package/norix-cli)
[![license](https://img.shields.io/npm/l/norix-cli.svg)](https://github.com/sreeragpariyarath/norix/blob/main/LICENSE)

Norix is a repository analysis CLI for Node.js projects.

It analyzes your workspace to identify frameworks, tooling, libraries, and project capabilities—entirely offline and without reading application source code.

> No AI. No network. No nonsense.

## Project Status

Norix is stable and actively maintained. The CLI is production-ready for repository analysis, with additional capabilities planned in future releases.

## Quick Start

Run `norix` instantly without installation using `npx`:

```bash
npx norix-cli
```

_By default, this analyzes the current working directory._

## Example Output

```
  norix  ·  Repository Analysis  ·  v1.0.0

  ────────────────────────────────────────────────────
  Repository     my-app
  Language       TypeScript
  Package Mgr    pnpm
  Type           Monorepo  (3 workspaces)

  ────────────────────────────────────────────────────
  Framework      Next.js
  ORM            Prisma
  Validation     Zod
  Auth           Auth.js
  Cache          Redis (ioredis)
  Queue          BullMQ
  Storage        AWS S3
  Email          Resend
  Payments       Stripe
  Testing        Vitest · Playwright
  HTTP Client    Axios
  Logging        Pino

  ────────────────────────────────────────────────────
  3 package.json files scanned  ·  0.3s
```

## Why Norix

When onboarding to a new codebase, auditing a repository, or setting up tooling, you need to quickly understand the project's stack.

Traditional approaches require either manual inspection of dependency files or sharing code with remote API endpoints. `norix` solves this locally and instantly with zero configuration. It parses package definitions and metadata, compares them against a built-in technology registry, and outputs a clear hierarchy of the project's capabilities.

## Features

- **Stack Identification**: Automatically map packages to their roles (e.g. Next.js under Framework, Prisma under ORM, Zod under Validation).
- **Capability Overlaps**: Flags when competing libraries are used for the same purpose (e.g. having both `axios` and `got` installed) to help you keep dependencies clean.
- **Monorepo Detection**: Works out of the box with `npm`/`yarn`/`pnpm` workspaces, Turborepo, Nx, and Lerna.
- **Offline & Private**: Never accesses the network, makes no API calls, and processes everything locally.
- **Machine-Readable Exports**: Generates clean JSON and Markdown reports for continuous integration, auditing, or codebase documentation.

## Installation

Install `norix` globally using your preferred package manager:

```bash
npm install -g norix-cli
# or
pnpm add -g norix-cli
# or
yarn global add norix-cli
```

## Usage

`norix` provides five main commands: `analyze`, `insights`, `graph`, `doctor`, and `report`.

### 1. Analyze the Stack

Shows the high-level repository overview and detected capabilities.

```bash
norix analyze [options]
```

### 2. Project Insights

Generates AI-ready architecture reports with project archetypes, strengths, risks, and recommendations.

```bash
norix insights [options]
```

### 3. Architecture Graph

Visualizes project architecture dependencies in ASCII tree, Mermaid, or JSON formats.

```bash
norix graph --format=tree
norix graph --format=mermaid
norix graph --format=json
```

### 4. Check Repository Health

Scans the project for potential capability overlaps (e.g. multiple loggers or HTTP clients).

```bash
norix doctor [options]
```

### 5. Generate Reports

Export the analysis results to Markdown or JSON formats for documentation or automated tooling.

```bash
norix report [options]
```

## Supported Technologies

`norix` recognizes a broad set of tools across different categories:

| Category        | Examples / Supported Packages                                                                 |
| :-------------- | :-------------------------------------------------------------------------------------------- |
| **Framework**   | Next.js, Express, NestJS, Fastify, Hono, Remix, Astro, SvelteKit, Elysia, React, Vue, Angular |
| **Database**    | PostgreSQL, MySQL, MongoDB, SQLite, Supabase, Neon, Turso                                     |
| **ORM**         | Prisma, Drizzle, TypeORM, Sequelize, Mongoose, Kysely                                         |
| **Validation**  | Zod, Yup, Joi, Valibot, class-validator, ArkType                                              |
| **Auth**        | Auth.js, Clerk, Lucia, Better Auth, Passport.js                                               |
| **Cache**       | Redis, ioredis, Upstash Redis, LRU Cache                                                      |
| **Queue**       | BullMQ, pg-boss, Kafka, Inngest, Trigger.dev                                                  |
| **Storage**     | AWS S3, Cloudinary, UploadThing, Vercel Blob                                                  |
| **Email**       | Resend, Nodemailer, SendGrid, React Email                                                     |
| **Payments**    | Stripe, Lemon Squeezy, Razorpay, PayPal                                                       |
| **Testing**     | Vitest, Jest, Playwright, Cypress, Testing Library                                            |
| **HTTP Client** | Axios, Got, ky, undici                                                                        |
| **Date**        | date-fns, Day.js, Moment.js, Luxon                                                            |
| **Logging**     | Pino, Winston, Consola                                                                        |
| **Docs**        | Storybook, VitePress, Docusaurus, TypeDoc                                                     |
| **Build**       | Vite, Webpack, esbuild, Turborepo, Nx                                                         |

## Output Formats

Norix supports exporting repository analysis results in multiple formats using the `--format` option on the `analyze` command:

```bash
norix analyze --format=<format>
```

| Format              | Description                                                         | Example command                   |
| :------------------ | :------------------------------------------------------------------ | :-------------------------------- |
| `summary` (default) | A polished, human-readable terminal report grouped by layer         | `norix analyze --format=summary`  |
| `json`              | A structured, machine-readable JSON schema for API ingestion        | `norix analyze --format=json`     |
| `yaml`              | A clean YAML equivalent of the scan capabilities report             | `norix analyze --format=yaml`     |
| `markdown`          | A GitHub-ready markdown document detailing scanned metadata         | `norix analyze --format=markdown` |
| `csv`               | A flat tabular format listing one capability match per row          | `norix analyze --format=csv`      |
| `sarif`             | A valid SARIF v2.1.0 JSON payload suitable for GitHub Code Scanning | `norix analyze --format=sarif`    |

### JSON Output Example

```json
{
  "version": "1",
  "norixVersion": "2.0.0",
  "timestamp": "2026-08-01T10:00:00Z",
  "repository": {
    "name": "my-app",
    "isMonorepo": true,
    "workspaces": ["apps/web", "apps/api"],
    "language": "TypeScript",
    "packageManager": "pnpm"
  },
  "capabilities": {
    "framework": [{ "label": "Next.js", "matchedPackages": ["next"], "role": "meta-framework" }],
    "orm": [{ "label": "Prisma", "matchedPackages": ["@prisma/client"], "role": "orm" }],
    "validation": [{ "label": "Zod", "matchedPackages": ["zod"], "role": "validation" }]
  },
  "meta": {
    "packageJsonCount": 3,
    "durationMs": 42
  }
}
```

## Monorepo Support

`norix` detects workspace layouts automatically by scanning for:

- `package.json` workspaces (`workspaces` array or object)
- `pnpm-workspace.yaml` files
- Workspace-level tools (`turbo.json`, `nx.json`, `lerna.json`)

Capabilities and dependencies are aggregated across all workspace packages, presenting a single cohesive picture of the monorepo's stack.

## CLI Options

```
norix <command> [options]

Commands:
  analyze          Show repository overview (default)
  doctor           Show repository health and capability overlaps
  report           Generate Markdown and JSON reports

Global Options:
  -c, --cwd <path> Set working directory (default: current directory)
  -v, --version    Show version number
  -h, --help       Show help message

Command Options:
  analyze
    --json         Output as JSON to stdout (deprecated in favor of --format=json)
    --format       Format to output: summary | json | yaml | markdown | csv | sarif (default: summary)

  doctor
    --json         Output findings as JSON to stdout
    --severity     Filter findings: warning | info | all (default: all)

  report
    --format       Format to output: markdown | json | all (default: all)
    --output <dir> Output directory (default: current directory)
    --no-doctor    Exclude health findings from report
```

## Development

Prerequisites: Node.js (>= 18) and a package manager.

```bash
# Clone the repository
git clone https://github.com/sreeragpariyarath/norix.git
cd norix

# Install dependencies
npm install

# Build the project
npm run build

# Run the compiled binary locally against this repo
node dist/index.js analyze
```

## Detector Plugin System

Norix features a dynamic plugin architecture, enabling third-party packages to register custom capability detectors without modifying the core CLI source code.

### 1. Configuration

Add a configuration file to your repository root named `norix.config.json` (or `norix.config.js` / `norix.config.mjs`) containing the paths to your plugins:

```json
{
  "plugins": ["./plugins/flutter-plugin", "@company/custom-detectors"]
}
```

### 2. Creating a Plugin

A Norix plugin is a standard JavaScript module that default-exports (or named-exports as `plugin`) an object implementing the `NorixPlugin` interface:

```typescript
import { NorixPlugin } from 'norix-cli';
import { MyCustomDetector } from './MyCustomDetector.js';

const myPlugin: NorixPlugin = {
  name: 'My Custom Plugin',
  version: '1.0.0',
  norix: '^1.0.0 || ^2.0.0',
  description: 'Detects internal custom frameworks and tools',
  homepage: 'https://github.com/my-org/custom-plugin',
  register(registry) {
    registry.registerDetector(this, MyCustomDetector);
  },
};

export default myPlugin;
```

A custom detector class simply implements the standard `Detector` interface. For a complete reference implementation, check the [examples/flutter-plugin/](file:///c:/Me/packages/norix/examples/flutter-plugin) directory.

### 3. CLI Command

To view all currently active core detectors and loaded third-party plugins:

```bash
norix plugins
```

## Performance Benchmarking

Norix includes a performance benchmarking suite to measure and analyze execution times, memory usage, cache hit rates, and individual detector efficiency.

To run the benchmarks:

```bash
npm run benchmark
```

This compiles the benchmark runner, generates dynamic test workspaces in your OS temp directory, and executes the scan against cold and warm caches. It generates a markdown report detailing the metrics inside `benchmark/results.md` and prints the output to stdout.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for improvements or additional library detections.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

[MIT](LICENSE)
