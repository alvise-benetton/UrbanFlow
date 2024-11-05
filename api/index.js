const express = require('express');
const connectDB = require('./services/db.services');
const authRoutes = require('./routers/auth.route');
const userRoutes = require('./routers/user.route');
require('dotenv').config();

const app = express();


// Connessione al database
connectDB();

// Middleware per il parsing JSON
app.use(express.json());


// rotte utenti
app.use('/api/users', userRoutes);
//app.use('/api/events',eventRoutes);
//app.use('/api/zones',zoneRoutes);
app.use('/api/auth',authRoutes);

/* // Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
}); */


// process.on('uncaughtException', (err) => {
//   console.error('Unhandled exception:', err);
//   process.exit(1); // Chiude il processo
// });

// process.on('SIGINT', () => {
//   console.log('Caught interrupt signal');
//   process.exit(); // Chiude il processo in caso di interruzione manuale (Ctrl + C)
// });

// Avvio del server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));
