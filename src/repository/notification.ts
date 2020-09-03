import { Repository, getCustomRepository, EntityRepository } from 'typeorm';
import { Notification } from '../entity/notification';
import TeacherRepository from '../repository/teacher';
import StudentRepository from '../repository/student';
import { Student } from '../entity/student';
import { Teacher } from '../entity/teacher';
import { ParseMentions } from '../utils';

@EntityRepository(Notification)
export class NotificationRepository extends Repository<Notification> {
  async Broadcast(teacher: string, message: string) {
    let mentions = ParseMentions(message);
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
