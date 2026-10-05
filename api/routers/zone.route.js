const ZoneService = require("../services/zone.services.js");
const express = require('express');
const router = express.Router();

router.get('/',ZoneService.getZones);
router.get('/:id',ZoneService.getZoneById);
router.put('/:id',ZoneService.updateZone);


module.exports = router;