import { z } from 'zod';

// Ebook request schema for the landing page
export const ebookRequestSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  created_at: z.coerce.date(),
  email_sent: z.boolean()
});

export type EbookRequest = z.infer<typeof ebookRequestSchema>;

// Input schema for creating ebook requests
export const createEbookRequestInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format").max(255, "Email too long")
});

export type CreateEbookRequestInput = z.infer<typeof createEbookRequestInputSchema>;

// Response schema for successful ebook request submission
export const ebookRequestResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  id: z.number().optional()
});

export type EbookRequestResponse = z.infer<typeof ebookRequestResponseSchema>;