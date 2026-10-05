const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const User = require('./models/user.model');
const Event = require('./models/event.model');
const Zone = require('./models/zone.model');
const CameraData = require('./models/cameraData.model'); // Assicurati che il path sia corretto
const db = require('./services/db.services');
require('dotenv').config();

db.connect();

// Importa dati da file JSON esterni
const zonesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seeds/zones.json'), 'utf8'));
const eventsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seeds/events.json'), 'utf8'));
const cameraData = JSON.parse(fs.readFileSync(path.join(__dirname, 'seeds/camera_data.json'), 'utf8'));

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

async function seedDatabase() {
  try {
    // await User.deleteMany({});
    await Event.deleteMany({});
    await Zone.deleteMany({});
    await CameraData.deleteMany({});
    console.log('Database svuotato');

    /*
    for (const userData of usersData) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
      await new User(userData).save();
    }
    console.log('Utenti inseriti');

    
    */
    await Event.insertMany(eventsData);
    console.log('Eventi inseriti da JSON');
    await Zone.insertMany(zonesData);
    console.log('Zone inserite da JSON');
    
    await CameraData.insertMany(cameraData);
    console.log('Dati delle camere inseriti da JSON');

    mongoose.connection.close();
    console.log('Popolamento completato e connessione chiusa');
  } catch (err) {
    console.error('Errore nel seeding:', err);
    mongoose.connection.close();
  }
}

module.exports = seedDatabase;
