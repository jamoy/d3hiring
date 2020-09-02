import { createConnection } from 'typeorm';

export async function initialize() {
  return await createConnection({
    name: 'default',
    type: 'mysql',
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306,
    username: process.env.MYSQL_USERNAME || 'mysql',
    password: process.env.MYSQL_PASSWORD || 'password',
    database: process.env.MYSQL_DATABASE || 'd3hiring',
    synchronize: process.env.NODE_ENV !== 'production',
    cache: process.env.NODE_ENV === 'production',
    entities: [__dirname + '/entity/*{.js,.ts}'],
  });
}
