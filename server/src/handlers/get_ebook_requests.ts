import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { type EbookRequest } from '../schema';
import { desc } from 'drizzle-orm';

export const getEbookRequests = async (): Promise<EbookRequest[]> => {
  try {
    // Fetch all ebook requests ordered by creation date (newest first)
    const results = await db.select()
      .from(ebookRequestsTable)
      .orderBy(desc(ebookRequestsTable.created_at))
      .execute();

    // Convert the database results to match the schema type
    return results.map(request => ({
      id: request.id,
      name: request.name,
      email: request.email,
      created_at: request.created_at,
      email_sent: request.email_sent
    }));
  } catch (error) {
    console.error('Failed to fetch ebook requests:', error);
    throw error;
  }
};