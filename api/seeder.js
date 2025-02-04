const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user.model');
const Event = require('./models/event.model');
const Zone = require('./models/zone.model');
const db = require('./services/db.services');
require('dotenv').config();

db.connect();

const usersData = [
  {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'password_mario', 
    role: 'admin',
  },
  {
    name: 'Luca',
    surname: 'Bianchi',
    email: 'luca.bianchi@example.com',
    password: 'password_luca',
    role: 'user',
  },
  {
    name: 'Giulia',
    surname: 'Verdi',
    email: 'giulia.verdi@example.com',
    password: 'password_giulia',
    role: 'admin',
  },
];

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
];

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

async function seedDatabase() {
  try {
    // Cancella i dati esistenti
    await User.deleteMany({});
    await Event.deleteMany({});
    await Zone.deleteMany({});
    console.log('Database svuotato');

    // Inserisci utenti con password criptate
    for (const userData of usersData) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      const user = new User(userData);
      await user.save();
    }
    console.log('Dati utenti inseriti con password criptate');

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

seedDatabase();
