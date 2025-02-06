const cameraDataService = require("../services/cameraData.service");
const express = require('express');
const router = express.Router();

router.get('/',cameraDataService.getCameraData);
//router.get('/:id',);
router.post('/',cameraDataService.createNewCameraData);


module.exports = router;