import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { getEbookRequests } from '../handlers/get_ebook_requests';
import { eq } from 'drizzle-orm';

describe('getEbookRequests', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no requests exist', async () => {
    const result = await getEbookRequests();
    
    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all ebook requests', async () => {
    // Create test data
    const testRequests = [
      { name: 'John Doe', email: 'john@example.com' },
      { name: 'Jane Smith', email: 'jane@example.com' },
      { name: 'Bob Wilson', email: 'bob@example.com' }
    ];

    // Insert test data
    for (const request of testRequests) {
      await db.insert(ebookRequestsTable)
        .values({
          name: request.name,
          email: request.email,
          email_sent: false
        })
        .execute();
    }

    const result = await getEbookRequests();

    expect(result).toHaveLength(3);
    
    // Verify all requests are returned
    const names = result.map(r => r.name).sort();
    expect(names).toEqual(['Bob Wilson', 'Jane Smith', 'John Doe']);
    
    const emails = result.map(r => r.email).sort();
    expect(emails).toEqual(['bob@example.com', 'jane@example.com', 'john@example.com']);
  });

  it('should return requests with correct field types and values', async () => {
    // Create a single test request with known values
    const testRequest = {
      name: 'Test User',
      email: 'test@example.com',
      email_sent: true
    };

    const insertedRequest = await db.insert(ebookRequestsTable)
      .values(testRequest)
      .returning()
      .execute();

    const result = await getEbookRequests();

    expect(result).toHaveLength(1);
    
    const request = result[0];
    expect(request.id).toBe(insertedRequest[0].id);
    expect(request.name).toBe('Test User');
    expect(request.email).toBe('test@example.com');
    expect(request.email_sent).toBe(true);
    expect(request.created_at).toBeInstanceOf(Date);
    
    // Verify field types
    expect(typeof request.id).toBe('number');
    expect(typeof request.name).toBe('string');
    expect(typeof request.email).toBe('string');
    expect(typeof request.email_sent).toBe('boolean');
  });

  it('should return requests ordered by creation date (newest first)', async () => {
    // Create requests with slight delays to ensure different timestamps
    const firstRequest = await db.insert(ebookRequestsTable)
      .values({
        name: 'First User',
        email: 'first@example.com',
        email_sent: false
      })
      .returning()
      .execute();

    // Small delay to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    const secondRequest = await db.insert(ebookRequestsTable)
      .values({
        name: 'Second User',
        email: 'second@example.com',
        email_sent: false
      })
      .returning()
      .execute();

    await new Promise(resolve => setTimeout(resolve, 10));

    const thirdRequest = await db.insert(ebookRequestsTable)
      .values({
        name: 'Third User',
        email: 'third@example.com',
        email_sent: false
      })
      .returning()
      .execute();

    const result = await getEbookRequests();

    expect(result).toHaveLength(3);
    
    // Should be ordered by creation date descending (newest first)
    expect(result[0].name).toBe('Third User');
    expect(result[1].name).toBe('Second User');
    expect(result[2].name).toBe('First User');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should handle requests with different email_sent statuses', async () => {
    // Create requests with different email_sent values
    await db.insert(ebookRequestsTable)
      .values([
        {
          name: 'User 1',
          email: 'user1@example.com',
          email_sent: false
        },
        {
          name: 'User 2',
          email: 'user2@example.com',
          email_sent: true
        }
      ])
      .execute();

    const result = await getEbookRequests();

    expect(result).toHaveLength(2);
    
    const emailSentStatuses = result.map(r => r.email_sent).sort();
    expect(emailSentStatuses).toEqual([false, true]);
    
    // Find specific users and verify their email_sent status
    const user1 = result.find(r => r.name === 'User 1');
    const user2 = result.find(r => r.name === 'User 2');
    
    expect(user1?.email_sent).toBe(false);
    expect(user2?.email_sent).toBe(true);
  });

  it('should verify data persistence in database', async () => {
    // Insert via handler's database connection
    await db.insert(ebookRequestsTable)
      .values({
        name: 'Database User',
        email: 'db@example.com',
        email_sent: false
      })
      .execute();

    const result = await getEbookRequests();

    expect(result).toHaveLength(1);
    
    // Verify the data actually exists in the database
    const dbRecords = await db.select()
      .from(ebookRequestsTable)
      .where(eq(ebookRequestsTable.email, 'db@example.com'))
      .execute();

    expect(dbRecords).toHaveLength(1);
    expect(dbRecords[0].name).toBe('Database User');
    expect(dbRecords[0].email).toBe('db@example.com');
    expect(dbRecords[0].email_sent).toBe(false);
  });
});