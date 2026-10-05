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
const zone = require('./models/zone.model');
const mongoose = require('mongoose');
const updateCameraData = require('./serverFill');
const seedDatabase = require('./seeder');



require('dotenv').config();

const app = express();
app.use(cors());
// Connessione al database
if (process.env.NODE_ENV !== 'test') {
    db.connect();
}


// Middleware per il parsing JSON
app.use(express.json());
app.use(logger);

// rotte utenti
app.use('/api/session',sessionRoutes);
app.use('/api/users', tokenChecker, userRoutes);
app.use('/api/events', tokenChecker, eventRoutes);
app.use('/api/zones',tokenChecker, zoneRoutes);
app.use('/api/cameraData',tokenChecker,cameraDataRoutes);


// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
const sec = 1000;
const min = 60* sec;
// updateCameraData();
//setTimeout(updateCameraData,1 * min); // aggiunge dati casuali al db ogni 5 secondi
module.exports = app;
//seedDatabase();



