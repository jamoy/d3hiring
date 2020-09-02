import pino from 'pino';

export default pino({
  level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
  prettyPrint:
    process.env.NODE_ENV !== 'production'
      ? {
          colorize: true,
          ignore: 'pid,hostname',
          levelFirst: true,
        }
      : false,
});
