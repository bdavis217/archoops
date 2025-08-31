import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import cookie from '@fastify/cookie';
import { config } from '@archoops/config';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { userId: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN' };
    user: { userId: string; role: 'STUDENT' | 'TEACHER' | 'ADMIN' };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    ensureAuth: (role?: 'STUDENT' | 'TEACHER' | 'ADMIN') => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

async function authPlugin(fastify: FastifyInstance) {
  // Register JWT plugin
  await fastify.register(jwt, {
    secret: config.jwtSecret(),
    cookie: {
      cookieName: 'ah_session',
      signed: false,
    },
  });

  // Note: Cookie plugin is registered in the main server file

  // Auth decorator
  fastify.decorate('ensureAuth', (requiredRole?: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        
        if (requiredRole && request.user.role !== requiredRole) {
          return reply.code(403).send({
            error: 'Forbidden',
            message: `This endpoint requires ${requiredRole} role`,
          });
        }
      } catch (err) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Authentication required',
        });
      }
    };
  });
}

export default fp(authPlugin);
