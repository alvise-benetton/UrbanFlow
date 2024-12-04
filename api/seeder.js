const mongoose = require('mongoose');
const User = require('./models/user.model');
const Event = require('./models/event.model');
const Zone = require('./models/zone.model');
const db = require('./services/db.services');
require('dotenv').config();

db.connect();


// Dati di esempio per il modello User
const usersData = [
  {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'hashed_password_mario', // Usa bcrypt per hashare le password se necessario
    ruolo: 'admin',
  },
  {
    name: 'Luca',
    surname: 'Bianchi',
    email: 'luca.bianchi@example.com',
    password: 'hashed_password_luca',
    ruolo: 'user',
  },
  {
    name: 'Giulia',
    surname: 'Verdi',
    email: 'giulia.verdi@example.com',
    password: 'hashed_password_giulia',
    ruolo: 'editor',
  },
];

// Dati di esempio per il modello Event
const eventsData = [
  {
    title: "Festival dell'economia",
    startDate: "2024-11-19T15:00:00.000Z",
    endDate: "2024-11-19T18:00:00.000Z",
    zones: [1, 2],
  },
  {
    title: 'Conferenza sulla tecnologia',
    startDate: "2024-12-01T10:00:00.000Z",
    endDate: "2024-12-01T12:30:00.000Z",
    zones: [3, 4, 5],
  },
  {
    title: 'Workshop di design',
    startDate: "2024-12-05T14:00:00.000Z",
    endDate: "2024-12-05T16:00:00.000Z",
    zones: [2],
  },
  {
    title: 'Workshop di design',
    startDate: "2024-12-05T14:00:00.000Z",
    endDate: "2024-12-05T16:00:00.000Z",
    zones: [2],
  },
];

// Dati di esempio per il modello Zone
const zonesData = [
    {
      name: 'Zona Nord',
      zone: [10, 20],
      latestData: {
        density: 50,
        date: new Date(),
      },
      threshold: 200,
    },
    {
      name: 'Zona Sud',
      zone: [30, 40],
      latestData: {
        density: 80,
        date: new Date(),
      },
      threshold: 250,
    },
    {
      name: 'Zona Est',
      zone: [15, 25],
      latestData: {
        density: 100,
        date: new Date(),
      },
      threshold: 300,
    },
  ];
  


// Funzione per popolare il database
async function seedDatabase() {
  try {
    // Cancella i dati esistenti
    await User.deleteMany({});
    await Event.deleteMany({});
    await Zone.deleteMany({});
    console.log('Database svuotato');

    // Inserisce i nuovi dati
    await User.insertMany(usersData);
    console.log('Dati utenti inseriti');

    await Event.insertMany(eventsData);
    console.log('Dati eventi inseriti');

    await Zone.insertMany(zonesData);
    console.log('Dati zone inseriti');

 
    console.log('Popolamento del database completato');
    mongoose.connection.close();
  } catch (err) {
    console.error('Errore durante il popolamento del database:', err);
    mongoose.connection.close();
  }
}

// Esegui la funzione
seedDatabase();
