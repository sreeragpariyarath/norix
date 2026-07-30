import type { DbEntry } from '../types.js';

export const queueEntries: DbEntry[] = [
  { packages: ['bullmq'], label: 'BullMQ', role: 'redis-queue' },
  { packages: ['bull'], label: 'Bull', role: 'redis-queue' },
  { packages: ['bee-queue'], label: 'Bee Queue', role: 'redis-queue' },
  { packages: ['pg-boss'], label: 'pg-boss', role: 'postgres-queue' },
  { packages: ['agenda'], label: 'Agenda', role: 'document-queue' },
  { packages: ['amqplib'], label: 'RabbitMQ (amqplib)', role: 'message-broker' },
  { packages: ['kafkajs'], label: 'Kafka (KafkaJS)', role: 'message-broker' },
  { packages: ['@aws-sdk/client-sqs'], label: 'AWS SQS', role: 'managed-queue' },
  { packages: ['inngest'], label: 'Inngest', role: 'serverless-queue' },
  { packages: ['trigger.dev', '@trigger.dev/sdk'], label: 'Trigger.dev', role: 'serverless-queue' },
];
