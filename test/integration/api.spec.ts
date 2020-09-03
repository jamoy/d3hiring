require('dotenv').config();
import * as database from '../../src/database';
import faker = require('faker');
import * as api from '../../src/api';

describe('D3Hiring Assessment', () => {
  let instance: any;
  let jwt: string;

  beforeAll(async () => {
    await database.initialize();
    instance = await api.bootstrap(true);
    const response = await instance.inject({
      method: 'POST',
      url: '/api/authorize',
      payload: { teacher: 'test@gmail.com ' },
    });
    jwt = response.json().token;
  });

  afterAll(async () => {
    await database.close();
  });

  describe('1. As a teacher, I want to register one or more students to a specified teacher.', () => {
    it('can register a teacher with multiple students', async () => {
      const teacher = faker.internet.email();
      const student1 = faker.internet.email();
      const student2 = faker.internet.email();
      const response = await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher,
          students: [student1, student2],
        },
      });
      expect(response.statusCode).toBe(204);
      const validation = await instance.inject({
        method: 'GET',
        url: '/api/commonstudents',
        headers: { Authorization: `Bearer ${jwt}` },
        query: {
          teacher,
        },
      });
      expect(validation.statusCode).toBe(200);
      expect(validation.json()).toEqual(
        expect.objectContaining({
          students: expect.arrayContaining([student1]),
        })
      );
    });

    it('fails because teacher is empty', async () => {
      const response = await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(response.statusCode).toBe(500);
      expect(response.json()).toEqual(
        expect.objectContaining({
          error: expect.objectContaining({ message: "body should have required property 'teacher'" }),
        })
      );
    });
  });

  describe('2. As a teacher, I want to retrieve a list of students common to a given list of teachers (i.e. retrieve students who are registered to ALL of the given teachers).', () => {
    it('can fetch students for a specific teacher', async () => {
      const teacher = faker.internet.email();
      const student1 = faker.internet.email();
      await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher,
          students: [student1],
        },
      });
      const response = await instance.inject({
        method: 'GET',
        url: '/api/commonstudents',
        headers: { Authorization: `Bearer ${jwt}` },
        query: {
          teacher: teacher,
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          students: expect.arrayContaining([student1]),
        })
      );
    });
  });

  describe('3. As a teacher, I want to suspend a specified student.', () => {
    it('can suspend a student', async () => {
      const teacher = faker.internet.email();
      const student1 = faker.internet.email();
      const student2 = faker.internet.email();
      await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher,
          students: [student1, student2],
        },
      });
      const response = await instance.inject({
        method: 'POST',
        url: '/api/suspend',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          student: student2,
        },
      });
      expect(response.statusCode).toBe(204);
      const validation = await instance.inject({
        method: 'GET',
        url: '/api/commonstudents',
        headers: { Authorization: `Bearer ${jwt}` },
        query: {
          teacher: teacher,
        },
      });
      expect(validation.json()).not.toEqual(
        expect.objectContaining({
          students: expect.arrayContaining([student2]),
        })
      );
    });
  });

  describe('4. As a teacher, I want to retrieve a list of students who can receive a given notification.', () => {
    it('can send notification to all non suspended students registered to a teacher', async () => {
      const teacher = faker.internet.email();
      const student1 = faker.internet.email();
      const student2 = faker.internet.email();
      await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher,
          students: [student1, student2],
        },
      });
      const response = await instance.inject({
        method: 'POST',
        url: '/api/retrievefornotifications',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher: teacher,
          notification: 'test',
        },
      });
      expect(response.json()).toEqual(
        expect.objectContaining({
          recipients: expect.arrayContaining([student1]),
        })
      );
      expect(response.json()).toEqual(
        expect.objectContaining({
          recipients: expect.arrayContaining([student2]),
        })
      );
    });
    it('can send notification to all non suspended students that are mentioned in the message', async () => {
      const teacher = faker.internet.email();
      const student1 = faker.internet.email();
      const student2 = faker.internet.email();
      const mention = faker.internet.email();
      await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher,
          students: [student1, student2],
        },
      });
      const response = await instance.inject({
        method: 'POST',
        url: '/api/retrievefornotifications',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher: teacher,
          notification: 'test @' + mention,
        },
      });
      expect(response.json()).toEqual(
        expect.objectContaining({
          recipients: expect.arrayContaining([student1]),
        })
      );
      expect(response.json()).toEqual(
        expect.objectContaining({
          recipients: expect.arrayContaining([student2]),
        })
      );
      expect(response.json()).toEqual(
        expect.objectContaining({
          recipients: expect.arrayContaining([mention]),
        })
      );
    });
  });
});

export {}; // because typescript complains for --isolateModules
