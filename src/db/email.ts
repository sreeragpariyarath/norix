import type { DbEntry } from '../types.js';

export const emailEntries: DbEntry[] = [
  { packages: ['nodemailer'], label: 'Nodemailer', role: 'smtp-client' },
  { packages: ['resend'], label: 'Resend', role: 'email-api' },
  { packages: ['@sendgrid/mail'], label: 'SendGrid', role: 'email-api' },
  { packages: ['postmark'], label: 'Postmark', role: 'email-api' },
  { packages: ['mailersend'], label: 'MailerSend', role: 'email-api' },
  { packages: ['@mailchimp/mailchimp_transactional'], label: 'Mailchimp', role: 'email-api' },
  { packages: ['aws-sdk', '@aws-sdk/client-ses'], label: 'AWS SES', role: 'email-api' },
  { packages: ['@react-email/components', '@react-email/render'], label: 'React Email', role: 'email-template' },
];
