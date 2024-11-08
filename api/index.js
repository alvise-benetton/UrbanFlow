const express = require('express');
const db = require('./services/db.services');
const sessionRoutes = require('./routers/session.route');
const userRoutes = require('./routers/user.route');
const logger = require('./middleware/logger');
const tokenChecker = require('./middleware/tokenChecker');
require('dotenv').config();

const app = express();

// Connessione al database
db.connect();

// Middleware per il parsing JSON
app.use(express.json());
app.use(logger);


// rotte utenti
app.use('/api/session',sessionRoutes);
app.use(tokenChecker); // Le rotte sottostanti saranno richiedono autenticazione
app.use('/api/users', userRoutes);
//app.use('/api/events',eventRoutes);
//app.use('/api/zones',zoneRoutes);


// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
