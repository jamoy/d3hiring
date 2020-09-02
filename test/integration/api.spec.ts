import * as db from '../../src/database';

require('dotenv').config();
import * as database from '../../src/database';
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
      const response = await instance.inject({
        method: 'POST',
        url: '/api/register',
        headers: { Authorization: `Bearer ${jwt}` },
        payload: {
          teacher: 'teacherken@gmail.com',
          students: ['studentjon@gmail.com', 'studenthon@gmail.com'],
        },
      });
      expect(response.statusCode).toBe(204);
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
      const response = await instance.inject({
        method: 'GET',
        url: '/api/commonstudents',
        headers: { Authorization: `Bearer ${jwt}` },
        query: {
          teacher: 'teacherken@gmail.com',
        },
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(
        expect.objectContaining({
          students: expect.any(Array),
        })
      );
    });
  });
});

export {}; // because typescript complains for --isolateModules
