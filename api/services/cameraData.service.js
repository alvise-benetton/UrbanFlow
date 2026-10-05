const CameraData = require('../models/cameraData.model');
const Zone = require('../models/zone.model');

async function getCameraData(req, res) {
  try {
    const isLatest = req.query.latest === 'true';
    const projection = isLatest ? { zone: 1, data: { $slice: 1 } } : '-updatedAt -__v';
    const query = CameraData.find({}, projection);
    const zones = typeof query.lean === 'function' ? await query.lean() : await query;
    res.json(zones);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function createNewCameraData(req, res) {
  try {
    const { zone: zoneId, density } = req.body;

    if (typeof density !== 'number' || density < 0 || !zoneId) {
      return res.status(400).json({ message: 'Bad request' });
    }

    const zoneQuery = Zone.findById(zoneId);
    const zone = typeof zoneQuery.lean === 'function' ? await zoneQuery.lean() : await zoneQuery;
    if (!zone) {
      return res.status(404).json({ message: 'Zona non trovata' });
    }

    let cameraRecord = await CameraData.findOne({ zone: zoneId });
    if (!cameraRecord) {
      cameraRecord = new CameraData({ zone: zoneId, data: [] });
    }

    cameraRecord.data.unshift({
      density,
      timestamp: Date.now(),
    });

    await cameraRecord.save();
    return res.status(201).json({ zone: zoneId, density });
  } catch (err) {
    return res.status(500).send('Errore del server');
  }
}

module.exports = { getCameraData, createNewCameraData };
