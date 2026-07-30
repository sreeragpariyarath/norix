# norix

> Repository Intelligence CLI — understand your codebase instantly.

`norix` scans your repository and tells you exactly what technologies, frameworks, and capabilities it uses.

**No AI. No network. No nonsense.**

---

## Install

```bash
npm install -g @sreeragpariyarath/norix
# or
npx @sreeragpariyarath/norix analyze
```

## Usage

```bash
# Run inside any Node.js repository
norix analyze
```

### Example Output

```
  norix  ·  Repository Intelligence  ·  v0.5.0

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

---

## What It Detects

| Category | Examples |
|---|---|
| Framework | Next.js, Express, NestJS, Fastify, Hono, Remix, Astro |
| Database | PostgreSQL, MySQL, MongoDB, SQLite, Supabase, Neon, Turso |
| ORM | Prisma, Drizzle, TypeORM, Sequelize, Mongoose, Kysely |
| Validation | Zod, Yup, Joi, Valibot, class-validator, ArkType |
| Auth | Auth.js, Clerk, Lucia, Better Auth, Passport.js |
| Cache | Redis, ioredis, Upstash Redis, LRU Cache |
| Queue | BullMQ, pg-boss, Kafka, Inngest, Trigger.dev |
| Storage | AWS S3, Cloudinary, UploadThing, Vercel Blob |
| Email | Resend, Nodemailer, SendGrid, React Email |
| Payments | Stripe, Lemon Squeezy, Razorpay, PayPal |
| Testing | Vitest, Jest, Playwright, Cypress, Testing Library |
| HTTP Client | Axios, Got, ky, undici |
| Date | date-fns, Day.js, Moment.js, Luxon |
| Logging | Pino, Winston, Consola |
| Docs | Storybook, VitePress, Docusaurus, TypeDoc |
| Build | Vite, Webpack, esbuild, Turborepo, Nx |

---

## Options

```
norix analyze [options]

Options:
  --cwd <path>   Target directory  (default: current directory)
  --json         Output as JSON
  --version      Show version
  --help         Show help
```

## JSON Output

```bash
norix analyze --json
```

```json
{
  "version": "1",
  "norixVersion": "0.5.0",
  "timestamp": "2025-01-01T10:00:00Z",
  "repository": {
    "name": "my-app",
    "isMonorepo": true,
    "workspaces": ["apps/web", "apps/api"],
    "language": "TypeScript",
    "packageManager": "pnpm"
  },
  "capabilities": {
    "framework": [{ "label": "Next.js", "matchedPackages": ["next"] }],
    "orm": [{ "label": "Prisma", "matchedPackages": ["@prisma/client"] }],
    "validation": [{ "label": "Zod", "matchedPackages": ["zod"] }]
  },
  "meta": {
    "packageJsonCount": 3,
    "durationMs": 42
  }
}
```

---

## Monorepo Support

Norix automatically detects and scans:
- npm/yarn workspaces (`package.json#workspaces`)
- pnpm workspaces (`pnpm-workspace.yaml`)
- Turborepo / Nx / Lerna projects

Capabilities are aggregated across **all** workspace packages.

---

## Capability Overlaps

If multiple tools in the same category are detected (e.g. both `axios` and `got`), they appear highlighted in yellow in the terminal output — a subtle signal worth reviewing.

No judgements. No errors. Just information.

---

## Development

```bash
git clone https://github.com/sreerag/norix
cd norix
npm install
npm run build

# Test against this repo
node dist/index.js analyze
```

---

## Roadmap

- [x] `norix analyze` — repository overview
- [ ] `norix doctor` — capability overlap detection
- [ ] `norix report` — Markdown + JSON reports
- [ ] Plugin system
- [ ] GitHub Action
- [ ] MCP server

---

## License

MIT
