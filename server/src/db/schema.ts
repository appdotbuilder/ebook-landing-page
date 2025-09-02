import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const ebookRequestsTable = pgTable('ebook_requests', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  email_sent: boolean('email_sent').default(false).notNull(),
});

// TypeScript type for the table schema
export type EbookRequest = typeof ebookRequestsTable.$inferSelect; // For SELECT operations
export type NewEbookRequest = typeof ebookRequestsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { ebookRequests: ebookRequestsTable };