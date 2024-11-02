// Importa Express
const express = require('express');
const app = express();
const PORT = 3000;

require('dotenv').config()
//console.log(process.env)
const mongoose = require('mongoose');

// server ancora da creare
app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connesso al database");
    // avvio server
    app.listen(PORT, () => {
        console.log(`Server in ascolto su http://localhost:${PORT}`);
    });
    
});

// importo rotte
const userRoutes = require('./routers/user.route');
const authRoutes = require('./routers/auth.route')

// Definisco il body in JSON (middleware)
app.use(express.json());

app.use((req,res,next)=>{
  console.log(req.method, req.url,Date(Date.now()));
  next();
})

// Una semplice route GET
app.get('/', (req, res) => {
  res.send('Hello World');
});

// rotte utenti
app.use('/api/users', userRoutes);
//app.use('/api/events',eventRoutes);
//app.use('/api/zones',zoneRoutes);
app.use('/api/auth',authRoutes);

/* // Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
}); */


process.on('uncaughtException', (err) => {
  console.error('Unhandled exception:', err);
  process.exit(1); // Chiude il processo
});

process.on('SIGINT', () => {
  console.log('Caught interrupt signal');
  process.exit(); // Chiude il processo in caso di interruzione manuale (Ctrl + C)
});
