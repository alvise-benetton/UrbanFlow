const express = require('express');
const db = require('./services/db.services');
const sessionRoutes = require('./routers/session.route');
const userRoutes = require('./routers/user.route');
const eventRoutes = require('./routers/event.route');
const zoneRoutes = require('./routers/zone.route');
const logger = require('./middleware/logger');
const tokenChecker = require('./middleware/tokenChecker').tokenChecker;
const cors = require('cors');
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



// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
