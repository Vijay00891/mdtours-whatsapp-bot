// Simple structured logger — no extra dependencies
// Outputs: [2026-04-15T01:32:00.000Z] [LEVEL] message

const levels = { INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
  console.log(`[${timestamp}] [${level}] ${message}${metaStr}`);
}

const logger = {
  info:  (msg, meta) => log(levels.INFO,  msg, meta),
  warn:  (msg, meta) => log(levels.WARN,  msg, meta),
  error: (msg, meta) => log(levels.ERROR, msg, meta),
};

module.exports = logger;
