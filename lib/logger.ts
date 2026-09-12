import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
});

export const logger = {
  info: (...args: any[]) => {
    if (args.length > 1 && typeof args[0] === 'string') {
      const msg = args.shift();
      pinoLogger.info(args.length === 1 ? args[0] : args, msg);
    } else if (args.length > 0) {
      pinoLogger.info(args[0], ...args.slice(1));
    }
  },
  warn: (...args: any[]) => {
    if (args.length > 1 && typeof args[0] === 'string') {
      const msg = args.shift();
      pinoLogger.warn(args.length === 1 ? args[0] : args, msg);
    } else if (args.length > 0) {
      pinoLogger.warn(args[0], ...args.slice(1));
    }
  },
  error: (...args: any[]) => {
    if (args.length > 1 && typeof args[0] === 'string') {
      const msg = args.shift();
      pinoLogger.error(args.length === 1 ? args[0] : args, msg);
    } else if (args.length > 0) {
      pinoLogger.error(args[0], ...args.slice(1));
    }
  },
};
