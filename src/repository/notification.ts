import { Repository, getCustomRepository, EntityRepository } from 'typeorm';
import { Notification } from '../entity/notification';
import TeacherRepository from '../repository/teacher';
import StudentRepository from '../repository/student';
import { Student } from '../entity/student';
import isEmail from 'validator/lib/isEmail';
import { Teacher } from '../entity/teacher';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  async Broadcast(teacher: string, message: string) {
    let mentions = message.match(/[@]+[A-Za-z0-9_.@]+/g);
    mentions = mentions ? mentions.map(mention => mention.substr(1)).filter(mention => isEmail(mention)) : [];

    const existingTeacher = await TeacherRepository.findOne({ email: teacher });
    const recipients = await TeacherRepository.RegisteredTo([teacher]);
    let notification = this.create();
    notification.message = message;
    if (existingTeacher) {
      notification.teacher = existingTeacher;
    }
    notification.students = [];
    if (recipients) {
      recipients
        .map((teacher: Teacher) => teacher.students)
        .flat()
        .map((student: Student) => notification.students.push(student));
    }
    const existingMentions = await StudentRepository.Exists(mentions);
    if (existingMentions) {
      existingMentions
        .filter((student: Student) => student.suspended === false)
        .filter((student: Student) => !notification.students.map((student: Student) => student.id).includes(student.id))
        .map((student: Student) => notification.students.push(student));
    }
    await this.save(notification);
    return {
      recipients: [
        ...(recipients
          ? recipients
              .map((teacher: Teacher) => teacher.students)
              .flat()
              .filter((student: Student) => student.suspended === false)
              .map((student: Student) => student.email)
          : []),
        ...mentions,
      ],
    };
  }
}

export default getCustomRepository(NotificationRepository);
