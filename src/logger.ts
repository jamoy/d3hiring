import pino from 'pino';

export default pino({
  prettyPrint:
    process.env.NODE_ENV !== 'production'
      ? {
          colorize: true,
          ignore: 'pid,hostname',
          levelFirst: true,
        }
      : false,
});
