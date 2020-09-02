import { Repository, getCustomRepository, EntityRepository } from 'typeorm';
import { Notification } from '../entity/notification';
import TeacherRepository from '../repository/teacher';
import StudentRepository from '../repository/student';
import { Student } from '../entity/student';
import ApiError from '../error';
import isEmail from 'validator/lib/isEmail';
import { Teacher } from '../entity/teacher';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  private parseMessageForStudents(message: string) {
    return [];
  }

  async Broadcast(teacher: string, message: string) {
    let mentions = message.match(/[@]+[A-Za-z0-9_.@]+/g);
    mentions = mentions ? mentions.map(e => e.substr(1)).filter(e => isEmail(e)) : [];

    const t = await TeacherRepository.findOne({ email: teacher });
    const recipients = await TeacherRepository.RegisteredTo([teacher]);
    let n = this.create();
    n.message = message;
    if (t) {
      n.teacher = t;
    }
    n.students = [];
    if (recipients) {
      recipients
        .map((o: Teacher) => o.students)
        .flat()
        .map((s: Student) => n.students.push(s));
    }
    const existingMentions = await StudentRepository.Exists(mentions);
    if (existingMentions) {
      existingMentions
        .filter((s: Student) => s.suspended === false)
        .filter((s: Student) => !n.students.map((s: Student) => s.id).includes(s.id))
        .map((s: Student) => n.students.push(s));
    }
    await this.save(n);
    return {
      recipients: [
        ...(recipients
          ? recipients
              .map((o: Teacher) => o.students)
              .flat()
              .filter((s: Student) => s.suspended === false)
              .map((s: Student) => s.email)
          : []),
        ...mentions,
      ],
    };
  }
}

export default getCustomRepository(NotificationRepository);
