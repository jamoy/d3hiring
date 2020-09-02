import { createConnection, getConnection } from 'typeorm';

export async function initialize() {
  return await createConnection({
    name: 'default',
    type: 'mysql',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    username: process.env.MYSQL_USERNAME || 'mysql',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'd3hiring',
    synchronize: true,
    cache: process.env.NODE_ENV === 'production',
    entities: [__dirname + '/entity/*{.js,.ts}'],
  });
}

export async function close() {
  const connection = getConnection();
  await connection.close();
}
