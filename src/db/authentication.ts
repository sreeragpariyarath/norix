import type { DbEntry } from '../types.js';

export const authenticationEntries: DbEntry[] = [
  { packages: ['@auth/core', 'next-auth'], label: 'Auth.js', role: 'auth-framework' },
  { packages: ['better-auth'], label: 'Better Auth', role: 'auth-framework' },
  { packages: ['lucia'], label: 'Lucia', role: 'auth-framework' },
  {
    packages: ['@supabase/auth-helpers-nextjs', '@supabase/auth-helpers-react'],
    label: 'Supabase Auth',
    role: 'auth-framework',
  },
  {
    packages: ['@clerk/nextjs', '@clerk/clerk-sdk-node', '@clerk/backend'],
    label: 'Clerk',
    role: 'auth-service',
  },
  { packages: ['firebase-admin'], label: 'Firebase Auth (Admin)', role: 'auth-service' },
  { packages: ['@workos-inc/node'], label: 'WorkOS', role: 'auth-service' },
  { packages: ['passport'], label: 'Passport.js', role: 'auth-middleware' },
  { packages: ['jsonwebtoken'], label: 'jsonwebtoken', role: 'token-signing' },
  { packages: ['jose'], label: 'jose (JWT/JWK)', role: 'token-signing' },
  { packages: ['iron-session'], label: 'Iron Session', role: 'session-management' },
];
