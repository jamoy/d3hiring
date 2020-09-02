import { FastifyReply, FastifyRequest } from 'fastify';
import StudentRepository from '../repository/student';
import ApiError from '../error';

export default async function Suspend(request: FastifyRequest, reply: FastifyReply) {
  if (request.body) {
    const { student } = request.body as { student: string };
    await StudentRepository.Suspend(student);
    return reply.status(204).send('');
  }
  throw new ApiError('No request body sent', 400, 'ERR400');
}
