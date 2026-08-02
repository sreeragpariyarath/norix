/**
 * Graph Category Mapping Configuration
 *
 * Maps CapabilityCategory and roles to standardized Architecture Graph Categories.
 */

import { CapabilityCategory } from '../engine/types/Capability.js';

export const GRAPH_CATEGORY_LABELS: Record<string, string> = {
  [CapabilityCategory.Framework]: 'Frameworks',
  [CapabilityCategory.Database]: 'Database',
  [CapabilityCategory.ORM]: 'ORM',
  [CapabilityCategory.Cache]: 'Cache',
  [CapabilityCategory.Queue]: 'Queue',
  [CapabilityCategory.Storage]: 'Storage',
  [CapabilityCategory.AI]: 'AI',
  [CapabilityCategory.Cloud]: 'Cloud',
  [CapabilityCategory.Container]: 'Infrastructure',
  [CapabilityCategory.Testing]: 'Testing',
  [CapabilityCategory.BuildTool]: 'Build Tools',
  [CapabilityCategory.CSS]: 'Styling',
  [CapabilityCategory.Authentication]: 'Authentication',
  [CapabilityCategory.Payment]: 'Payments',
  [CapabilityCategory.Monitoring]: 'Monitoring',
  [CapabilityCategory.Analytics]: 'Analytics',
};

/**
 * Maps a capability match role or category to a primary display layer.
 */
export function getLayerCategory(category: string, role?: string): string {
  if (role === 'meta-framework' || role === 'ui-library') {
    return 'Frontend';
  }
  if (role === 'server-framework' || role === 'api-layer') {
    return 'Backend';
  }
  if (role === 'relational-driver' || role === 'document-driver' || role === 'managed-db') {
    return 'Database';
  }
  if (role === 'relational-orm' || role === 'document-orm' || role === 'query-builder') {
    return 'ORM';
  }
  if (role === 'monorepo-tool') {
    return 'Monorepo';
  }
  if (role === 'ci-cd') {
    return 'CI/CD';
  }
  if (role === 'deployment-platform' || role === 'containerizer' || role === 'orchestrator') {
    return 'Infrastructure';
  }
  if (role === 'test-runner' || role === 'e2e-testing') {
    return 'Testing';
  }

  return GRAPH_CATEGORY_LABELS[category] ?? 'Other';
}
