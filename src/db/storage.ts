import type { DbEntry } from '../types.js';

export const storageEntries: DbEntry[] = [
  { packages: ['@aws-sdk/client-s3', 'aws-sdk'], label: 'AWS S3', role: 'object-storage' },
  { packages: ['@google-cloud/storage'], label: 'Google Cloud Storage', role: 'object-storage' },
  { packages: ['@azure/storage-blob'], label: 'Azure Blob Storage', role: 'object-storage' },
  { packages: ['minio'], label: 'MinIO', role: 'object-storage' },
  { packages: ['@supabase/storage-js'], label: 'Supabase Storage', role: 'managed-storage' },
  { packages: ['@vercel/blob'], label: 'Vercel Blob', role: 'managed-storage' },
  { packages: ['cloudinary'], label: 'Cloudinary', role: 'media-cdn' },
  { packages: ['uploadthing'], label: 'UploadThing', role: 'upload-service' },
];
