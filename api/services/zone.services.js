const Zone = require('../models/zone.model'); 
const express = require('express');
const router = express.Router();

async function getZones(req, res) {
  try {
    // Recupera la lista di tutte le zone senza campi non necessari
    const zones = await Zone.find({}, '-createdAt -updatedAt -__v');
    res.json(zones);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

async function getZoneById(req, res) {
  const zoneId = req.params.id;
  try {
    // Trova la zona per ID e escludi campi non necessari
    const zone = await Zone.findById(zoneId, '-createdAt -updatedAt -__v');
    if (!zone) {
      return res.status(404).json({ message: 'Zona non trovata' });
    }
    res.json(zone);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}


async function updateZone(req, res) {
  try {
    const zoneId = req.params.id;
    const updates = req.body;

    // Trova e aggiorna la zona
    const updatedZone = await Zone.findByIdAndUpdate(
      zoneId,
      updates,
      { new: true, runValidators: true } // Restituisci il documento aggiornato e valida i dati
    ).select('-createdAt -updatedAt -__v');

    if (!updatedZone) {
      return res.status(404).json({ message: 'Zona non trovata' });
    }

    res.json({ data: updatedZone });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

module.exports = { getZones, getZoneById, updateZone };

