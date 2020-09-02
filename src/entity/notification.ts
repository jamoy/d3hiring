import {
  CreateDateColumn,
  ManyToOne,
  JoinTable,
  JoinColumn,
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
} from 'typeorm';
import { Teacher } from './teacher';
import { Student } from './student';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(type => Teacher)
  @JoinColumn()
  teacher: Teacher;

  @ManyToMany(type => Student, student => student.notifications)
  @JoinTable()
  students: Student[];
}
