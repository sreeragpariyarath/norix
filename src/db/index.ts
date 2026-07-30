/**
 * Capability Database (CDB) Index
 *
 * Assembles all modular capability categories into a unified CapabilityDb object.
 */

import type { CapabilityDb } from '../types.js';
import { frameworkEntries } from './framework.js';
import { databaseEntries } from './database.js';
import { ormEntries } from './orm.js';
import { validationEntries } from './validation.js';
import { authenticationEntries } from './authentication.js';
import { cacheEntries } from './cache.js';
import { queueEntries } from './queue.js';
import { storageEntries } from './storage.js';
import { emailEntries } from './email.js';
import { paymentsEntries } from './payments.js';
import { testingEntries } from './testing.js';
import { httpClientEntries } from './httpClient.js';
import { dateUtilityEntries } from './dateUtility.js';
import { loggingEntries } from './logging.js';
import { documentationEntries } from './documentation.js';
import { buildEntries } from './build.js';

export const DB: CapabilityDb = {
  framework: frameworkEntries,
  database: databaseEntries,
  orm: ormEntries,
  validation: validationEntries,
  authentication: authenticationEntries,
  cache: cacheEntries,
  queue: queueEntries,
  storage: storageEntries,
  email: emailEntries,
  payments: paymentsEntries,
  testing: testingEntries,
  httpClient: httpClientEntries,
  dateUtility: dateUtilityEntries,
  logging: loggingEntries,
  documentation: documentationEntries,
  build: buildEntries,
};
