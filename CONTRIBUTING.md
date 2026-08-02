# Contributing to Norix

Thank you for your interest in contributing to Norix! We welcome community contributions, especially adding new package detections and expanding the capability database.

---

## 🚀 Quick Start

1. **Fork and Clone**

   ```bash
   git clone https://github.com/<your-username>/norix.git
   cd norix
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Build & Test**
   ```bash
   npm run build
   node dist/index.js analyze
   ```

---

## 📦 Adding a New Package Detection

Most contributions involve expanding the Capability Database in `src/db.ts`.

### Rules for DB Entries:

1. **Packages array (`packages`)**: List the exact npm package names.
2. **Label (`label`)**: Use the official, human-readable name of the tool.
3. **Role (`role`)**: Specify the exact sub-type role.
   - _Example:_ `jest` has `role: 'test-runner'`, whereas `supertest` has `role: 'http-assertion'`.
   - _Why role matters:_ Two tools sharing the same role are flagged by `norix doctor` as competing overlaps, while tools with different roles are recognized as complementary.

### Example Entry:

```ts
{
  packages: ['hono'],
  label: 'Hono',
  role: 'server-framework'
}
```

---

## 🛠 Script Commands

- `npm run dev` — Watch mode for development
- `npm run build` — Build production bundle via `tsup`
- `npm run typecheck` — Run TypeScript type checking
- `npm run ci` — Full verification pipeline (typecheck + build)

---

## 🎨 Code Style

- Write clean, deterministic TypeScript (strict mode enabled).
- Keep dependencies minimal (zero runtime dependencies preferred, lightweight utilities only).
- Keep terminal output readable, subtle, and clean.

Thank you for helping make Norix better!
