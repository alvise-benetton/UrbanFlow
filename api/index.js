// Node.js >= 22 compatibility polyfill for legacy dependencies
const buffer = require('buffer');
if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}

const express = require('express');
const db = require('./services/db.services');
const sessionRoutes = require('./routers/session.route');
const userRoutes = require('./routers/user.route');
const eventRoutes = require('./routers/event.route');
const zoneRoutes = require('./routers/zone.route');
const cameraDataRoutes = require('./routers/cameraData.route');
const logger = require('./middleware/logger');
const tokenChecker = require('./middleware/tokenChecker').tokenChecker;
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());

// Connessione al database (esclusi i test)
if (process.env.NODE_ENV !== 'test') {
    db.connect();
}

// Middleware per il parsing JSON e logging
app.use(express.json());
app.use(logger);

// Rotte API
app.use('/api/session', sessionRoutes);
app.use('/api/users', tokenChecker, userRoutes);
app.use('/api/events', tokenChecker, eventRoutes);
app.use('/api/zones', tokenChecker, zoneRoutes);
app.use('/api/cameraData', tokenChecker, cameraDataRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;



