const pino = require('pino');
const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};
 const logger = pino({
  level: process.env.PINO_LOG_LEVEL || 'info',
  customLevels: levels,
  useOnlyCustomLevels: true,
  formatters: {
    bindings: (bindings) => {
      return { pid: bindings.pid, host: bindings.hostname, node_version: process.version };
    },
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      '*.address',
      '*.phone',
      '*.name',
      '*.password',
      '*.email',
    ],
    remove: true,
  },
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  },
});
 module.exports = logger;