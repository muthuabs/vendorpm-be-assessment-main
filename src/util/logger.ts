import { createLogger, format, transports } from 'winston';

const { combine, errors, timestamp } = format;

const baseFormat = combine(
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  format((info) => {
    return {
      ...info,
      level: info.level.toUpperCase(),
    };
  })()
);

const jsonFormat = combine(baseFormat, format.json());

export const setupLogger = () => {
  return createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: jsonFormat,
    transports: [new transports.Console()],
  });
};
