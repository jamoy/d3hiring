import jwt from 'jsonwebtoken';
import { FastifyReply, FastifyRequest } from 'fastify';

export default async function Authorize(request: FastifyRequest, reply: FastifyReply) {
  const { teacher } = request.body as { teacher: string };
  reply.send({
    token: jwt.sign({ teacher }, String(process.env.JWT_SECRET), {
      issuer: 'd3hiring',
      expiresIn: '1d',
    }),
  });
}
