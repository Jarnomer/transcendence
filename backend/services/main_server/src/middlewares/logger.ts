import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

async function loggerPlugin(fastify: FastifyInstance) {
  fastify.addHook('onRequest', (request: FastifyRequest, reply: FastifyReply, done) => {
    request.log.info({ url: request.raw.url, method: request.method }, 'Incoming request');
    done();
  });

  fastify.addHook('onResponse', (request: FastifyRequest, reply: FastifyReply, done) => {
    request.log.info(
      { statusCode: reply.statusCode, message: reply.raw.statusMessage },
      'Outgoing response'
    );
    done();
  });

  fastify.addHook('onSend', (request: FastifyRequest, reply: FastifyReply, payload, done) => {
    request.log.info({ payload }, 'Sending response');
    done();
  });

  fastify.addHook('onError', (request: FastifyRequest, reply: FastifyReply, error: Error, done) => {
    request.log.error({ message: error.message }, 'Error occurred');
    done();
  });
}

export default fp(loggerPlugin);

// logger.ts
function getStackTrace() {
  const error = new Error();
  const stack = error.stack?.split('\n')[3]; // Get the caller's stack frame
  const match = stack?.match(/\((.*):(\d+):(\d+)\)$/);
  if (match) {
    const filenameOnly = match[1].split('/').pop(); // Get the filename without the path
    return `${filenameOnly}:${match[2]}`; // Return "filename:line"
  }
  return 'unknown';
}

// Override console.log globally
const originalLog = console.log;

// console.log = (...args) => {
//   originalLog(`[${getStackTrace()}]`, ...args);
// };

console.log = (...args) => {
  const formattedArgs = args.map((arg) =>
    typeof arg === 'object'
      ? JSON.stringify(arg) // pretty-print JSON
      : arg
  );

  const logMessage = `[${getStackTrace()}] ${formattedArgs.join(' ')}`;

  // Add prefix on every line if multi-line
  originalLog(
    logMessage
      .split('\n')
      .map((line) => `${line}`)
      .join('\n')
  );
};

// You can override other console methods similarly
console.error = (...args) => {
  originalLog(`[ERROR] [${getStackTrace()}]`, ...args);
};

console.warn = (...args) => {
  originalLog(`[WARN] [${getStackTrace()}]`, ...args);
};
