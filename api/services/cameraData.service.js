const CameraData = require('../models/cameraData.model');
const express = require('express');
const Zone = require('../models/zone.model');
const router = express.Router();

async function getCameraData(req, res) {
  try {
    // Recupera la lista di tutte le misurazioni
    const zones = await CameraData.find({}, '-updatedAt -__v');
    
    res.json(zones);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}


async function createNewCameraData(req, res) {
  try {
    const zoneId = req.body.zone;
    const density = req.body.density;

    if(!density && density < 0)
        return res.status(400).json({message:"Bad request"});

    const zone = await Zone.findById(zoneId).then((zone)=>{
        if(zone){ // la zona è presente
            data = new CameraData({zone:zoneId,density:density/* ,createdAt:Date.now(),updatedAt:Date.now()*/});
            data.save();
        }else{
            return res.status(404).json({message:'Zona non trovata'});
        }

    })
    res.json({ zone });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

module.exports = { getCameraData, createNewCameraData };

