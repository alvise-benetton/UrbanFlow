// Importa Express
const express = require('express');
const app = express();

// Imposta una porta
const PORT = 3000;

// Middleware per il parsing dei JSON
app.use(express.json());

// Una semplice route GET
app.get('/', (req, res) => {
  res.send('Benvenuto nella mia API!');
});

// Una semplice route GET per dati di esempio
app.get('/api/users', (req, res) => {
  const users = [
    { id: 1, name: 'Mario Rossi' },
    { id: 2, name: 'Luigi Verdi' }
  ];
  res.json(users);
});

// Una route POST per creare nuovi utenti
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  // Qui puoi aggiungere logica per salvare l'utente nel database
  res.status(201).json(newUser);
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
