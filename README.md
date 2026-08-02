# Norix

> Repository Intelligence CLI for Node.js Projects

Analyze repositories, discover technology stacks, generate architecture insights, visualize system relationships, detect project health issues, and export machine-readable reports — entirely offline.

[![npm version](https://img.shields.io/npm/v/norix-cli.svg)](https://www.npmjs.com/package/norix-cli)
[![npm downloads](https://img.shields.io/npm/dm/norix-cli.svg)](https://www.npmjs.com/package/norix-cli)
[![license](https://img.shields.io/npm/l/norix-cli.svg)](https://github.com/sreeragpariyarath/norix/blob/main/LICENSE)

---

## Why Norix?

When joining an unfamiliar project, reviewing a codebase, or performing a technical audit, understanding the architecture can take hours.

Norix automates that process.

It scans your repository locally and identifies:

- Frameworks
- Databases
- ORMs
- Validation libraries
- Authentication
- Queues
- Storage
- Email providers
- Payment providers
- Build tools
- Infrastructure
- Testing frameworks
- Package managers
- Monorepo tooling
- CI/CD platforms
- Deployment platforms

No source code leaves your machine.

No AI APIs.

No telemetry.

No configuration required.

---

## Features

- Stack detection across 150+ technologies
- AI-ready architecture insights
- Interactive architecture graphs
- Repository health diagnostics
- Plugin system for custom detectors
- Monorepo support
- Offline analysis
- Multiple export formats
- Performance benchmarking
- Zero external services

---

## Installation

```bash
npm install -g norix-cli
```

or

```bash
pnpm add -g norix-cli
```

or

```bash
yarn global add norix-cli
```

---

## Quick Start

Analyze repository

```bash
norix analyze
```

Architecture insights

```bash
norix insights
```

Architecture graph

```bash
norix graph
```

Health report

```bash
norix doctor
```

Generate documentation

```bash
norix report
```

Loaded plugins

```bash
norix plugins
```

---

# Commands

| Command  | Description                 |
| -------- | --------------------------- |
| analyze  | Detect technologies         |
| insights | Architecture analysis       |
| graph    | Architecture visualization  |
| doctor   | Detect conflicts and issues |
| report   | Generate documentation      |
| plugins  | Show installed plugins      |

---

# Analyze

```bash
norix analyze
```

Detects:

- Frameworks
- Databases
- ORMs
- Validation
- Authentication
- Cache
- Queue
- Storage
- Email
- Payments
- Logging
- HTTP Clients
- Build Tools
- Testing
- CI/CD
- Deployment

---

# Insights

```bash
norix insights
```

Produces:

- Project archetype
- Strengths
- Architectural risks
- Recommendations
- AI-ready JSON
- Markdown report

---

# Graph

```bash
norix graph
```

Formats

```bash
norix graph --format tree
norix graph --format mermaid
norix graph --format json
```

Example

```
Repository
├── Frontend
│   ├── React
│   └── Next.js
├── Backend
│   └── NestJS
├── ORM
│   └── Prisma
└── Database
    └── PostgreSQL
```

---

# Doctor

```bash
norix doctor
```

Detects

- Duplicate libraries
- Competing frameworks
- Multiple HTTP clients
- Multiple loggers
- Capability conflicts

---

# Report

```bash
norix report
```

Exports

- Markdown
- JSON

---

# Output Formats

Analyze

```bash
norix analyze --format summary
norix analyze --format json
norix analyze --format yaml
norix analyze --format markdown
norix analyze --format csv
norix analyze --format sarif
```

Graph

```bash
tree
mermaid
json
```

Insights

```bash
text
json
markdown
```

---

# Plugin System

Norix supports third-party detector plugins.

Example

```json
{
  "plugins": ["./plugins/flutter-plugin", "@company/custom-plugin"]
}
```

List installed plugins

```bash
norix plugins
```

---

# Supported Technologies

## Frontend

- React
- Next.js
- Vue
- Angular
- SvelteKit
- Astro
- Remix
- Vite

## Backend

- Express
- NestJS
- Fastify
- Hono
- Elysia

## Databases

- PostgreSQL
- MySQL
- MongoDB
- SQLite
- Supabase
- Neon
- Turso

## ORM

- Prisma
- Drizzle
- TypeORM
- Sequelize
- Mongoose
- Kysely

## Testing

- Vitest
- Jest
- Playwright
- Cypress
- Mocha

...and many more.

---

# 📈 GitHub Statistics

<p align="center">
  <img src="profile-summary-card-output/github_dark/profile-details.svg" />
</p>

<p align="center">
  <img width="49%" src="profile-summary-card-output/github_dark/stats.svg" />
  <img width="49%" src="profile-summary-card-output/github_dark/repos-per-language.svg" />
</p>

<p align="center">
  <img width="49%" src="profile-summary-card-output/github_dark/most-commit-language.svg" />
  <img width="49%" src="profile-summary-card-output/github_dark/productive-time.svg" />
</p>

---

# Performance

Norix includes a benchmarking suite.

```bash
npm run benchmark
```

Measures

- Scan time
- Engine execution
- Cache hit rate
- Memory usage
- Detector performance

---

# Development

```bash
git clone https://github.com/sreeragpariyarath/norix.git

cd norix

npm install

npm run build

npm run ci
```

---

# Roadmap

Upcoming

- HTML reports
- SVG architecture diagrams
- AI explanation engine
- Security rule packs
- Custom reporting plugins
- Dependency timelines

---

# Contributing

Contributions are welcome.

```bash
git checkout -b feature/my-feature

git commit -m "feat: add awesome feature"

git push
```

Open a Pull Request.

---

# License

MIT
