import { DetectorFactory } from './DetectorFactory.js';
import { NextJsDetector } from '../detectors/NextJsDetector.js';
import { ReactDetector } from '../detectors/ReactDetector.js';
import { ViteDetector } from '../detectors/ViteDetector.js';
import { ExpressDetector } from '../detectors/ExpressDetector.js';
import { FastifyDetector } from '../detectors/FastifyDetector.js';
import { NestJsDetector } from '../detectors/NestJsDetector.js';
import { PostgresDetector } from '../detectors/PostgresDetector.js';
import { MySqlDetector } from '../detectors/MySqlDetector.js';
import { MariaDbDetector } from '../detectors/MariaDbDetector.js';
import { SqliteDetector } from '../detectors/SqliteDetector.js';
import { MongoDbDetector } from '../detectors/MongoDbDetector.js';
import { RedisDetector } from '../detectors/RedisDetector.js';
import { PrismaDetector } from '../detectors/PrismaDetector.js';
import { DrizzleDetector } from '../detectors/DrizzleDetector.js';
import { TypeOrmDetector } from '../detectors/TypeOrmDetector.js';
import { SequelizeDetector } from '../detectors/SequelizeDetector.js';
import { MongooseDetector } from '../detectors/MongooseDetector.js';
import { TurboRepoDetector } from '../detectors/TurboRepoDetector.js';
import { NxDetector } from '../detectors/NxDetector.js';

/**
 * Creates and returns a pre-registered DetectorFactory containing all capability detectors.
 */
export function createDefaultFactory(): DetectorFactory {
  const factory = new DetectorFactory();
  factory.register('nextjs', NextJsDetector);
  factory.register('react', ReactDetector);
  factory.register('vite', ViteDetector);
  factory.register('express', ExpressDetector);
  factory.register('fastify', FastifyDetector);
  factory.register('nestjs', NestJsDetector);
  factory.register('postgres', PostgresDetector);
  factory.register('mysql', MySqlDetector);
  factory.register('mariadb', MariaDbDetector);
  factory.register('sqlite', SqliteDetector);
  factory.register('mongodb', MongoDbDetector);
  factory.register('redis', RedisDetector);
  factory.register('prisma', PrismaDetector);
  factory.register('drizzle', DrizzleDetector);
  factory.register('typeorm', TypeOrmDetector);
  factory.register('sequelize', SequelizeDetector);
  factory.register('mongoose', MongooseDetector);
  factory.register('turborepo', TurboRepoDetector);
  factory.register('nx', NxDetector);
  return factory;
}
