import { FastifyReply, FastifyRequest } from 'fastify';
import TeacherRepository from '../repository/teacher';

export default async function CommonStudents(request: FastifyRequest, reply: FastifyReply) {
  const { teacher } = request.query as { teacher: string[] };
  const students = await TeacherRepository.Students(teacher ? (Array.isArray(teacher) ? teacher : [teacher]) : []);
  reply.send({ students });
}
