const Zone = require('../models/zone.model');

async function getZones(req, res) {
  try {
    const query = Zone.find({}, '-createdAt -updatedAt -__v');
    const zones = typeof query.lean === 'function' ? await query.lean() : await query;
    res.json(zones);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function getZoneById(req, res) {
  const zoneId = req.params.id;
  try {
    const query = Zone.findById(zoneId, '-createdAt -updatedAt -__v');
    const zone = typeof query.lean === 'function' ? await query.lean() : await query;
    if (!zone) {
      return res.status(404).json({ message: 'Zona non trovata' });
    }
    res.json(zone);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function updateZone(req, res) {
  try {
    const zoneId = req.params.id;
    const updates = req.body;

    const updatedZone = await Zone.findByIdAndUpdate(
      zoneId,
      updates,
      { new: true, runValidators: true }
    ).select('-createdAt -updatedAt -__v');

    if (!updatedZone) {
      return res.status(404).json({ message: 'Zona non trovata' });
    }

    res.json({ data: updatedZone });
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

module.exports = { getZones, getZoneById, updateZone };
