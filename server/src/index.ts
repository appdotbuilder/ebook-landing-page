import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

import { createEbookRequestInputSchema } from './schema';
import { createEbookRequest } from './handlers/create_ebook_request';
import { getEbookRequests } from './handlers/get_ebook_requests';
import { getEbookRequestStats } from './handlers/get_ebook_request_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create ebook request (main landing page form submission)
  createEbookRequest: publicProcedure
    .input(createEbookRequestInputSchema)
    .mutation(({ input }) => createEbookRequest(input)),
  
  // Get all ebook requests (admin only - should add auth in production)
  getEbookRequests: publicProcedure
    .query(() => getEbookRequests()),
  
  // Get ebook request statistics (admin dashboard)
  getEbookRequestStats: publicProcedure
    .query(() => getEbookRequestStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();