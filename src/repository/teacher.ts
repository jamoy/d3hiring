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
    let existingTeacher = await this.findOne({ email: teacher });
    if (!existingTeacher) {
      existingTeacher = this.create();
      existingTeacher.email = teacher;
      await this.save(existingTeacher);
    }
    existingTeacher.students = [];
    if (students.length > 0) {
      const toSave = [];
      let existingStudents = await StudentRepository.find({ where: students.map(s => ({ email: s })) });
      for (const student of students) {
        if (!student || !isEmail(student)) {
          throw new ApiError(`Student ${student} is not a valid email`, 400, 'ERR400');
        }
        const exists = existingStudents.find(existing => existing.email === student);
        if (exists) {
          existingTeacher.students.push(exists);
        } else {
          const newStudent = new Student();
          newStudent.email = student;
          toSave.push(newStudent);
          existingTeacher.students.push(newStudent);
        }
      }
      await connection.manager.save(toSave);
      await this.save(existingTeacher);
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
    let students: any = [];
    if (teacher.length > 0) {
      students = await this.RegisteredTo(teacher);
    }
    let commonStudents = await getRepository(Student)
      .createQueryBuilder('student')
      .where(qb => {
        const subQuery = qb.subQuery().select('studentId as id').from('teacher_students_student', 't').getQuery();
        return 'student.id NOT IN ' + subQuery;
      })
      .getMany();
    return [
      ...(students
        ? students
            .map((teacher: Teacher) => teacher.students)
            .flat()
            .filter((student: Student) => !student.suspended)
            .map((student: Student) => student.email)
        : []),
      ...(commonStudents
        ? commonStudents.filter(student => student.suspended === false).map(student => student.email)
        : []),
    ];
  }
}

export default getCustomRepository(TeacherRepository);
