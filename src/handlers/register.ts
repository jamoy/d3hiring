import { FastifyReply, FastifyRequest } from 'fastify';
import TeacherRepository from '../repository/teacher';
import ApiError from '../error';

export default async function Register(request: FastifyRequest, reply: FastifyReply) {
  if (request.body) {
    const { teacher, students } = request.body as { teacher: string; students: string[] };
    await TeacherRepository.Register(teacher, students);
    return reply.status(204).send('');
  }
  throw new ApiError('No request body sent', 400, 'ERR400');
}
