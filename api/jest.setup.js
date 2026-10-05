// Jest setup file: polyfill Buffer.SlowBuffer for Node.js >= 22 and increase timeout for MongoMemoryServer
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
if (!Buffer.SlowBuffer) {
  Buffer.SlowBuffer = Buffer;
}

// Allow ample time for MongoMemoryServer startup
jest.setTimeout(60000);
