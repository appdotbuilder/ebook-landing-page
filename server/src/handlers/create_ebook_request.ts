import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { type CreateEbookRequestInput, type EbookRequestResponse } from '../schema';
import { eq } from 'drizzle-orm';

export async function createEbookRequest(input: CreateEbookRequestInput): Promise<EbookRequestResponse> {
    try {
        // Check if email already exists
        const existingRequest = await db.select()
            .from(ebookRequestsTable)
            .where(eq(ebookRequestsTable.email, input.email))
            .limit(1)
            .execute();

        if (existingRequest.length > 0) {
            return {
                success: false,
                message: "This email address has already been used to request the ebook."
            };
        }

        // Create new ebook request record
        const result = await db.insert(ebookRequestsTable)
            .values({
                name: input.name,
                email: input.email,
                email_sent: false // Will be updated when email is actually sent
            })
            .returning()
            .execute();

        const newRequest = result[0];

        // TODO: In a real implementation, this is where you would:
        // 1. Send the ebook via email service (SendGrid, AWS SES, etc.)
        // 2. Update the email_sent status to true after successful email delivery
        // For now, we'll simulate successful creation

        return {
            success: true,
            message: "Thank you! Your ebook request has been received. Please check your email.",
            id: newRequest.id
        };
    } catch (error) {
        console.error('Ebook request creation failed:', error);
        return {
            success: false,
            message: "Sorry, something went wrong. Please try again later."
        };
    }
}