const mongoose = require('mongoose');
const CameraData = require('./models/cameraData.model'); // Assicurati di fornire il percorso corretto al tuo modello
const Zone = require('./models/zone.model');

// Funzione per generare una densità casuale
const generateRandomDensity = () => {
  return Math.floor(Math.random() * 100 + 20); // Cambia il range se necessario
};

// Funzione per aggiornare i dati
async function  updateCameraData(){
  try {
    const cameraDataList = await CameraData.find();


    // Modificare ogni documento
    for (const cameraData of cameraDataList) {
      // Creare un nuovo oggetto con densità casuale e timestamp
      const newDataEntry = {
        density: generateRandomDensity(),
        timestamp: Date.now(), // Aggiunge il timestamp attuale
      };
      // Aggiungere il nuovo oggetto all'inizio dell'array data
      cameraData.data.unshift(newDataEntry);

      // Salvare le modifiche
      await cameraData.save();
    }

    console.log('Dati aggiornati con successo!');
  } catch (error) {
    console.error('Errore durante l\'aggiornamento dei dati:', error);
  } 
};

module.exports = updateCameraData;
// Eseguire la funzione

