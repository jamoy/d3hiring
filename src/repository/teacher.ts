import { Repository, getCustomRepository, getConnection, EntityRepository, getRepository } from 'typeorm';
import isEmail from 'validator/lib/isEmail';
import { Teacher } from '../entity/teacher';
import { Student } from '../entity/student';
import StudentRepository from './student';
import ApiError from '../error';

const connection = getConnection();

@EntityRepository(Teacher)
export class TeacherRepository extends Repository<Teacher> {
  async Register(teacher: string, students: string[]) {
    if (!teacher || !isEmail(teacher)) {
      throw new ApiError('Teacher provided is not a valid email', 400, 'ERR400');
    }
    let t = await this.findOne({ email: teacher });
    if (!t) {
      t = this.create();
      t.email = teacher;
      await this.save(t);
    }
    t.students = [];
    if (students.length > 0) {
      const toSave = [];
      let s = await StudentRepository.find({ where: students.map(s => ({ email: s })) });
      for (const student of students) {
        if (!student || !isEmail(student)) {
          throw new ApiError(`Student ${student} is not a valid email`, 400, 'ERR400');
        }
        const exists = s.find(e => e.email === student);
        if (exists) {
          t.students.push(exists);
        } else {
          const e = new Student();
          e.email = student;
          toSave.push(e);
          t.students.push(e);
        }
      }
      await connection.manager.save(toSave);
      await this.save(t);
    }
  }

  async RegisteredTo(teacher: string[]) {
    teacher.map(email => {
      if (!email || !isEmail(email)) {
        throw new ApiError('Teacher provided is not a valid email', 400, 'ERR400');
      }
    });
    return this.find({ where: teacher.map(email => ({ email })), relations: ['students'] });
  }

  async Students(teacher: string[]) {
    let t: any = [];
    if (teacher.length > 0) {
      t = await this.RegisteredTo(teacher);
    }
    let c = await getRepository(Student)
      .createQueryBuilder('student')
      .where(qb => {
        const subQuery = qb.subQuery().select('studentId as id').from('teacher_students_student', 't').getQuery();
        return 'student.id NOT IN ' + subQuery;
      })
      .getMany();
    return [
      ...(t
        ? t
            .map((o: Teacher) => o.students)
            .flat()
            .filter((s: Student) => s.suspended === false)
            .map((s: Student) => s.email)
        : []),
      ...(c ? c.filter(s => s.suspended === false).map(s => s.email) : []),
    ];
  }
}

export default getCustomRepository(TeacherRepository);
