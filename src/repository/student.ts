import { Repository, getCustomRepository, EntityRepository } from 'typeorm';
import { Student } from '../entity/student';
import isEmail from 'validator/lib/isEmail';
import ApiError from '../error';

@EntityRepository(Student)
export class StudentRepository extends Repository<Student> {
  async Suspend(student: string) {
    if (!student || !isEmail(student)) {
      throw new ApiError('Student provided is not a valid email', 400, 'ERR400');
    }
    let t = await this.findOne({ email: student });
    if (t) {
      t.suspended = true;
      await this.save(t);
    }
  }

  async Exists(students: string[]) {
    return this.find({ where: students.map(email => ({ email })) });
  }
}

export default getCustomRepository(StudentRepository);
