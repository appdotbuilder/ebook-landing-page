import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { ebookRequestsTable } from '../db/schema';
import { getEbookRequestStats, type EbookRequestStats } from '../handlers/get_ebook_request_stats';

describe('getEbookRequestStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return zero stats when no requests exist', async () => {
    const stats = await getEbookRequestStats();

    expect(stats.totalRequests).toEqual(0);
    expect(stats.emailsSent).toEqual(0);
    expect(stats.pendingEmails).toEqual(0);
    expect(stats.requestsToday).toEqual(0);
  });

  it('should count total requests correctly', async () => {
    // Insert test data
    await db.insert(ebookRequestsTable).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
        email_sent: false
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        email_sent: true
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        email_sent: false
      }
    ]).execute();

    const stats = await getEbookRequestStats();

    expect(stats.totalRequests).toEqual(3);
  });

  it('should count emails sent and pending correctly', async () => {
    // Insert test data with mixed email_sent status
    await db.insert(ebookRequestsTable).values([
      {
        name: 'John Doe',
        email: 'john@example.com',
        email_sent: true
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        email_sent: true
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        email_sent: false
      },
      {
        name: 'Alice Brown',
        email: 'alice@example.com',
        email_sent: false
      }
    ]).execute();

    const stats = await getEbookRequestStats();

    expect(stats.totalRequests).toEqual(4);
    expect(stats.emailsSent).toEqual(2);
    expect(stats.pendingEmails).toEqual(2);
  });

  it('should count today\'s requests correctly', async () => {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Insert requests from different days
    await db.insert(ebookRequestsTable).values([
      {
        name: 'Today User 1',
        email: 'today1@example.com',
        email_sent: false,
        created_at: now
      },
      {
        name: 'Today User 2',
        email: 'today2@example.com',
        email_sent: true,
        created_at: now
      },
      {
        name: 'Yesterday User',
        email: 'yesterday@example.com',
        email_sent: false,
        created_at: yesterday
      }
    ]).execute();

    const stats = await getEbookRequestStats();

    expect(stats.totalRequests).toEqual(3);
    expect(stats.requestsToday).toEqual(2);
  });

  it('should handle edge case with requests at start of day', async () => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const justBeforeToday = new Date(startOfToday);
    justBeforeToday.setTime(justBeforeToday.getTime() - 1); // 1ms before start of today

    // Insert requests at edge times
    await db.insert(ebookRequestsTable).values([
      {
        name: 'Start of Day',
        email: 'start@example.com',
        email_sent: false,
        created_at: startOfToday
      },
      {
        name: 'Just Before Today',
        email: 'before@example.com',
        email_sent: false,
        created_at: justBeforeToday
      }
    ]).execute();

    const stats = await getEbookRequestStats();

    expect(stats.totalRequests).toEqual(2);
    expect(stats.requestsToday).toEqual(1); // Only the one at start of day
  });

  it('should return complete stats object with all required properties', async () => {
    // Insert some test data
    await db.insert(ebookRequestsTable).values([
      {
        name: 'Test User',
        email: 'test@example.com',
        email_sent: true
      }
    ]).execute();

    const stats = await getEbookRequestStats();

    // Check that all required properties exist
    expect(stats).toHaveProperty('totalRequests');
    expect(stats).toHaveProperty('emailsSent');
    expect(stats).toHaveProperty('pendingEmails');
    expect(stats).toHaveProperty('requestsToday');

    // Check that all values are numbers
    expect(typeof stats.totalRequests).toBe('number');
    expect(typeof stats.emailsSent).toBe('number');
    expect(typeof stats.pendingEmails).toBe('number');
    expect(typeof stats.requestsToday).toBe('number');
  });

  it('should handle large datasets efficiently', async () => {
    // Create a larger dataset to test performance
    const testData = Array.from({ length: 100 }, (_, i) => ({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      email_sent: i % 2 === 0 // Every other request has email sent
    }));

    await db.insert(ebookRequestsTable).values(testData).execute();

    const startTime = Date.now();
    const stats = await getEbookRequestStats();
    const endTime = Date.now();

    // Verify correctness
    expect(stats.totalRequests).toEqual(100);
    expect(stats.emailsSent).toEqual(50);
    expect(stats.pendingEmails).toEqual(50);

    // Performance should be reasonable (under 1 second for 100 records)
    expect(endTime - startTime).toBeLessThan(1000);
  });
});