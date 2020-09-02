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
    let existingStudent = await this.findOne({ email: student });
    if (existingStudent) {
      existingStudent.suspended = true;
      await this.save(existingStudent);
    }
  }

  async Exists(students: string[]) {
    const existingStudents = await this.find({ where: students.map(email => ({ email })) });
    const toSave: Student[] = [];
    students
      .filter(email => !existingStudents.map(student => student.email).includes(email))
      .map(email => {
        const newStudent = this.create();
        newStudent.email = email;
        toSave.push(newStudent);
      });
    await this.save(toSave);
    return await this.find({ where: students.map(email => ({ email })) });
  }
}

export default getCustomRepository(StudentRepository);
