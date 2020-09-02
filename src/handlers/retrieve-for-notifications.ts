import { FastifyReply, FastifyRequest } from 'fastify';
import NotificationRepository from '../repository/notification';
import ApiError from '../error';

export default async function RetrieveForNotifications(request: FastifyRequest, reply: FastifyReply) {
  if (request.body) {
    const { teacher, notification } = request.body as { teacher: string; notification: string };
    const recipients = await NotificationRepository.Broadcast(teacher, notification);
    return reply.send(recipients);
  }
  throw new ApiError('No request body sent', 400, 'ERR400');
}
