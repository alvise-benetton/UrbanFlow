const eventService = require("../services/event.services.js");
const express = require('express');
const router = express.Router();

router.get('/',eventService.getEvents);
router.get('/:id',eventService.getEventById);
router.post('/',eventService.createEvent);
router.put('/:id',eventService.updateEvent);
router.delete('/:id',eventService.deleteEvent);


module.exports = router;