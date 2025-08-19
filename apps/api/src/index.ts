import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import rateLimit from '@fastify/rate-limit';
import cookie from '@fastify/cookie';
import dotenv from 'dotenv';

// Import plugins and routes
import authPlugin from './plugins/auth.js';
import authRoutes from './routes/auth.js';
import classRoutes from './routes/classes.js';
import gameRoutes from './routes/games.js';
import predictionRoutes from './routes/predictions.js';
import debugGameRoutes from './routes/debug-games.js';

dotenv.config();

const server = Fastify({ 
  logger: true,
  // Ensure JSON parsing is enabled with proper content-type handling
  ignoreTrailingSlash: true,
});

// Register core plugins
await server.register(cors, { 
  origin: (origin, callback) => {
    // Allow requests from any localhost port in development
    if (!origin || /^https?:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true 
});
await server.register(sensible);
await server.register(cookie);

// Register rate limiting
await server.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// Register auth plugin
await server.register(authPlugin);

// Health check
server.get('/api/health', async () => ({ ok: true }));

// Register API routes with /api prefix
await server.register(async function (fastify) {
  await fastify.register(authRoutes, { prefix: '/api' });
  await fastify.register(classRoutes, { prefix: '/api' });
  await fastify.register(gameRoutes, { prefix: '/api' });
  await fastify.register(predictionRoutes, { prefix: '/api' });
  await fastify.register(debugGameRoutes, { prefix: '/api' });
});

const port = Number(process.env.PORT || 3001);

// Add a test endpoint to verify server is working
server.get('/api/test', async (request, reply) => {
  return reply.send({ message: 'API server is working!', timestamp: new Date().toISOString() });
});

server
	.listen({ port, host: '0.0.0.0' })
	.then(() => {
		server.log.info(`API listening on http://localhost:${port}`);
		server.log.info('Available routes:');
		server.log.info('  GET  /api/health');
		server.log.info('  GET  /api/test');
		server.log.info('  POST /api/auth/signup');
		server.log.info('  POST /api/auth/login');
		server.log.info('  POST /api/auth/logout');
		server.log.info('  GET  /api/me');
	})
	.catch((err) => {
		server.log.error('Failed to start server:', err);
		process.exit(1);
	});
