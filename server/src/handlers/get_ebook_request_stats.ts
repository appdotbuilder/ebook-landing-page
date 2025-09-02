import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { count, eq, gte } from 'drizzle-orm';

// Stats schema for ebook request analytics
export interface EbookRequestStats {
    totalRequests: number;
    emailsSent: number;
    pendingEmails: number;
    requestsToday: number;
}

export async function getEbookRequestStats(): Promise<EbookRequestStats> {
    try {
        // Get start of today for filtering today's requests
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Execute all queries concurrently for better performance
        const [
            totalRequestsResult,
            emailsSentResult,
            pendingEmailsResult,
            requestsTodayResult
        ] = await Promise.all([
            // Count total requests
            db.select({ count: count() })
                .from(ebookRequestsTable)
                .execute(),

            // Count emails that were sent
            db.select({ count: count() })
                .from(ebookRequestsTable)
                .where(eq(ebookRequestsTable.email_sent, true))
                .execute(),

            // Count pending emails (not sent)
            db.select({ count: count() })
                .from(ebookRequestsTable)
                .where(eq(ebookRequestsTable.email_sent, false))
                .execute(),

            // Count requests from today
            db.select({ count: count() })
                .from(ebookRequestsTable)
                .where(gte(ebookRequestsTable.created_at, today))
                .execute()
        ]);

        return {
            totalRequests: totalRequestsResult[0].count,
            emailsSent: emailsSentResult[0].count,
            pendingEmails: pendingEmailsResult[0].count,
            requestsToday: requestsTodayResult[0].count
        };
    } catch (error) {
        console.error('Failed to get ebook request stats:', error);
        throw error;
    }
}