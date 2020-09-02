import ApiError from '../error';
import jwt from 'jsonwebtoken';
import { FastifyRequest } from 'fastify';

export default async function TokenAuthorizer(request: FastifyRequest) {
  if (request.headers['authorization']) {
    try {
      jwt.verify(request.headers['authorization'].replace('Bearer ', ''), String(process.env.JWT_SECRET));
      return;
    } catch (err) {
      // do nothing
    }
  }
  throw new ApiError('Unauthorized', 401, 'ERR401');
}
