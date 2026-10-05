const Event = require('../models/event.model');

async function getEvents(req, res) {
  try {
    const filter = {};

    if (req.query.startDate && req.query.endDate) {
      filter.startDate = new Date(req.query.startDate);
      filter.endDate = new Date(req.query.endDate);
    } else if (req.query.startDate) {
      filter.startDate = new Date(req.query.startDate);
    } else if (req.query.endDate) {
      filter.endDate = new Date(req.query.endDate);
    }

    const query = Event.find(filter, '-createdAt -updatedAt -__v');
    const events = typeof query.lean === 'function' ? await query.lean() : await query;
    res.json(events);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function getEventById(req, res) {
  const eventId = req.params.id;
  try {
    const query = Event.findById(eventId, '-createdAt -updatedAt -__v');
    const event = typeof query.lean === 'function' ? await query.lean() : await query;
    if (!event) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }
    res.json(event);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function createEvent(req, res) {
  const { title, startDate, endDate, zones } = req.body;

  try {
    if (!(title && startDate && endDate && zones)) {
      return res.status(400).json({ error: 'Bad request: tutti i campi sono obbligatori' });
    }

    const query = Event.findOne({ title, startDate, endDate });
    const existingEvent = typeof query.lean === 'function' ? await query.lean() : await query;
    if (existingEvent) {
      return res.status(400).json({ error: 'Evento già presente con lo stesso titolo e date' });
    }

    const event = new Event({ title, startDate, endDate, zones });
    await event.save();

    res.status(201).json({
      message: 'Evento creato con successo',
      data: { title, startDate, endDate, zones }
    });
  } catch (err) {
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

    res.json({ data: updatedEvent });
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function deleteEvent(req, res) {
  try {
    const eventId = req.params.id;
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return res.status(404).json({ message: 'Evento non trovato' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

module.exports = { getEvents, getEventById, createEvent, updateEvent, deleteEvent };