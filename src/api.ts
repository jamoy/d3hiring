import fastify from 'fastify';
import openapi from 'fastify-openapi-glue';
import cors from 'fastify-cors';
import limiter from 'fastify-rate-limit';
import logger from './logger';
import * as uuid from 'uuid';
import path from 'path';

export async function bootstrap() {
  const instance = fastify({
    logger,
    pluginTimeout: 5000,
    trustProxy: true,
    maxParamLength: 100,
    disableRequestLogging: true,
    ignoreTrailingSlash: true,
    genReqId: () => {
      return uuid.v1().split('-').reverse().join('-');
    },
  });

  instance.register(cors, {
    origin: /d3hiring\.(com|dev)$/,
    credentials: true,
  });

  instance.setErrorHandler((error: any, request, reply) => {
    logger.error(error);
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: {
          error: error.code,
          message: error.message,
          id: request.id,
        },
      });
    }
    return reply.status(500).send({
      error: {
        error: 'ERR500',
        message: error.message || 'An unknown error has occurred.',
        id: request.id,
      },
    });
  });

  instance.register(async api => {
    if (process.env.NODE_ENV === 'production') {
      api.register(limiter, {
        max: 60,
        timeWindow: 60000,
        ban: 2,
        skipOnError: false,
        addHeaders: {
          'x-ratelimit-limit': false,
          'x-ratelimit-remaining': false,
          'x-ratelimit-reset': false,
          'retry-after': false,
        },
      });
    }

    api.register(openapi, {
      specification: path.resolve(__dirname, `../spec.oas3.yml`),
      securityHandlers: {
        TokenAuthorizer: require('./authorizer/token.ts').default,
      },
      prefix: 'api',
      noAdditional: true,
      service: {
        Authorize: require('./handlers/authorize').default,
        Register: require('./handlers/register').default,
        CommonStudents: require('./handlers/common-students').default,
        Suspend: require('./handlers/suspend').default,
        RetrieveForNotifications: require('./handlers/retrieve-for-notifications').default,
      },
    });
  });

  await instance.ready();
  return instance;
}
