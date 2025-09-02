import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { type CreateEbookRequestInput } from '../schema';
import { createEbookRequest } from '../handlers/create_ebook_request';
import { eq } from 'drizzle-orm';

// Test input data
const testInput: CreateEbookRequestInput = {
  name: 'John Doe',
  email: 'john.doe@example.com'
};

const testInput2: CreateEbookRequestInput = {
  name: 'Jane Smith',
  email: 'jane.smith@example.com'
};

describe('createEbookRequest', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a new ebook request successfully', async () => {
    const result = await createEbookRequest(testInput);

    expect(result.success).toBe(true);
    expect(result.message).toBe("Thank you! Your ebook request has been received. Please check your email.");
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
  });

  it('should save ebook request to database', async () => {
    const result = await createEbookRequest(testInput);

    // Verify the record was saved in the database
    const requests = await db.select()
      .from(ebookRequestsTable)
      .where(eq(ebookRequestsTable.id, result.id!))
      .execute();

    expect(requests).toHaveLength(1);
    expect(requests[0].name).toBe('John Doe');
    expect(requests[0].email).toBe('john.doe@example.com');
    expect(requests[0].email_sent).toBe(false);
    expect(requests[0].created_at).toBeInstanceOf(Date);
  });

  it('should prevent duplicate email addresses', async () => {
    // Create first request
    const firstResult = await createEbookRequest(testInput);
    expect(firstResult.success).toBe(true);

    // Attempt to create second request with same email
    const duplicateInput: CreateEbookRequestInput = {
      name: 'Different Name',
      email: 'john.doe@example.com' // Same email
    };

    const secondResult = await createEbookRequest(duplicateInput);
    expect(secondResult.success).toBe(false);
    expect(secondResult.message).toBe("This email address has already been used to request the ebook.");
    expect(secondResult.id).toBeUndefined();
  });

  it('should allow different email addresses', async () => {
    // Create first request
    const firstResult = await createEbookRequest(testInput);
    expect(firstResult.success).toBe(true);

    // Create second request with different email
    const secondResult = await createEbookRequest(testInput2);
    expect(secondResult.success).toBe(true);
    expect(secondResult.message).toBe("Thank you! Your ebook request has been received. Please check your email.");
    expect(secondResult.id).toBeDefined();
    expect(secondResult.id).not.toBe(firstResult.id);
  });

  it('should handle invalid input gracefully', async () => {
    // Test with invalid input that would cause constraint violations
    const invalidInput: CreateEbookRequestInput = {
      name: '', // This would violate NOT NULL if we had additional validation
      email: 'john.doe@example.com'
    };

    // First create a request with the email to test duplicate handling
    await createEbookRequest(testInput);

    // Then try with the same email but different name
    const result = await createEbookRequest(invalidInput);

    expect(result.success).toBe(false);
    expect(result.message).toBe("This email address has already been used to request the ebook.");
    expect(result.id).toBeUndefined();
  });

  it('should create requests with proper default values', async () => {
    const result = await createEbookRequest(testInput);
    expect(result.success).toBe(true);

    const requests = await db.select()
      .from(ebookRequestsTable)
      .where(eq(ebookRequestsTable.id, result.id!))
      .execute();

    const request = requests[0];
    expect(request.email_sent).toBe(false); // Default value
    expect(request.created_at).toBeInstanceOf(Date);
    
    // Verify created_at is recent (within last minute)
    const now = new Date();
    const timeDiff = now.getTime() - request.created_at.getTime();
    expect(timeDiff).toBeLessThan(60000); // Less than 1 minute
  });

  it('should handle edge case names and emails', async () => {
    const edgeCaseInput: CreateEbookRequestInput = {
      name: 'A', // Minimum length name
      email: 'test+tag@domain-with-dash.co.uk' // Complex valid email
    };

    const result = await createEbookRequest(edgeCaseInput);
    expect(result.success).toBe(true);

    const requests = await db.select()
      .from(ebookRequestsTable)
      .where(eq(ebookRequestsTable.id, result.id!))
      .execute();

    expect(requests[0].name).toBe('A');
    expect(requests[0].email).toBe('test+tag@domain-with-dash.co.uk');
  });

  it('should verify database integrity after multiple requests', async () => {
    // Create multiple requests
    const inputs = [
      { name: 'User 1', email: 'user1@test.com' },
      { name: 'User 2', email: 'user2@test.com' },
      { name: 'User 3', email: 'user3@test.com' }
    ];

    const results = [];
    for (const input of inputs) {
      const result = await createEbookRequest(input);
      expect(result.success).toBe(true);
      results.push(result);
    }

    // Verify all records exist in database
    const allRequests = await db.select()
      .from(ebookRequestsTable)
      .execute();

    expect(allRequests).toHaveLength(3);
    
    // Verify each record has unique ID
    const ids = allRequests.map(r => r.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);

    // Verify all emails are different
    const emails = allRequests.map(r => r.email);
    const uniqueEmails = new Set(emails);
    expect(uniqueEmails.size).toBe(3);
  });
});