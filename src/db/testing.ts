import type { DbEntry } from '../types.js';

export const testingEntries: DbEntry[] = [
  { packages: ['vitest'], label: 'Vitest', role: 'test-runner' },
  { packages: ['jest', 'ts-jest'], label: 'Jest', role: 'test-runner' },
  { packages: ['mocha'], label: 'Mocha', role: 'test-runner' },
  { packages: ['jasmine'], label: 'Jasmine', role: 'test-runner' },
  { packages: ['@playwright/test'], label: 'Playwright', role: 'e2e-testing' },
  { packages: ['cypress'], label: 'Cypress', role: 'e2e-testing' },
  { packages: ['puppeteer'], label: 'Puppeteer', role: 'browser-automation' },
  {
    packages: ['@testing-library/react', '@testing-library/vue', '@testing-library/svelte'],
    label: 'Testing Library',
    role: 'dom-testing',
  },
  { packages: ['supertest'], label: 'Supertest', role: 'http-assertion' },
  { packages: ['@vitest/ui'], label: 'Vitest UI', role: 'test-ui' },
];
