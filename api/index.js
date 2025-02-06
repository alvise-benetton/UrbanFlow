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
const cameraDataSchema = require('./models/cameraData.model');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
// Connessione al database
db.connect();

// Middleware per il parsing JSON
app.use(express.json());
app.use(logger);


// rotte utenti
app.use('/api/session',sessionRoutes);
app.use('/api/users', tokenChecker, userRoutes);
app.use('/api/events', tokenChecker, eventRoutes);
app.use('/api/zones',tokenChecker, zoneRoutes);
app.use('/api/cameraData',tokenChecker,cameraDataRoutes);

//cameraDataSchema.insertMany([{zone:"67a2181b3a63ef1e94127315",data:[{density:"150",timestamp:"1738830014"}]}]);

// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
