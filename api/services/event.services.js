const Event = require('../models/event.model');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

async function getEvents(req, res) {
    try {
        const events = await Event.find({}, '-createdAt -updatedAt -__v');
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Errore del server');
    }
}

async function getEventById(req, res) {
    const eventId = req.params.id;
    try {
        const events = await Event.findById(eventId, '-createdAt -updatedAt -__v');
        res.json(events);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Errore del server');
    }
}

async function createEvent(req, res) {
    const { title, startDate, endDate, zones } = req.body;
  
    try {
      // check prametri
      if (!(title && startDate && endDate && zones)) {
        return res.status(400).json({ error: 'Bad request: tutti i campi sono obbligatori' });
      }
  
      // Controlla se esiste già un evento con lo stesso titolo e le stesse date
      const existingEvent = await Event.findOne({ title, startDate, endDate });
      if (existingEvent) {
        return res.status(400).json({ error: 'Evento già presente con lo stesso titolo e date' });
      }
  
      // Crea un nuovo evento
      const event = new Event({ title, startDate, endDate, zones });
  
      // Salva l'evento nel database
      await event.save();
  
      // Risposta con i dettagli dell'evento creato
      res.status(201).json({
        message: 'Evento creato con successo',
        data: { title, startDate, endDate, zones }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Errore del server' });
    }
  }


  async function updateEvent(req, res) {
    try {
      const eventId = req.params.id;  
      const updates = req.body;      
  
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        updates,
        { new: true, runValidators: true } 
      ).select('-createdAt -updatedAt -__v');
  
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Evento non trovato' });
      }
  
      res.json({data: updatedEvent });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Errore del server');
    }
  }

  async function deleteEvent(req, res) {
    try {
      const eventId = req.params.id; // Estrai l'ID dell'Evento dalla route
  
      // Trova l'Evento tramite l'ID e lo elimina
      const deletedEvent = await Event.findByIdAndDelete(eventId);
  
      if (!deletedEvent) {
        return res.status(404).json({ message: 'Evento non trovato' });
      }
  
      res.json({ message: 'Evento eliminato con successo' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Errore del server');
    }
  }

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent} 