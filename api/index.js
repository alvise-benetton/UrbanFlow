// Importa Express
const express = require('express');
const app = express();
const PORT = 3000;

require('dotenv').config()
const mongoose = require('mongoose');

app.locals.db = mongoose.connect(process.env.DB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
.then ( () => {
    
    console.log("Connected to Database");
    
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
    
});

// importo rotte
const userRoutes = require('./routers/user.route');

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
//app.use('/api/auth',authRoutes);

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
