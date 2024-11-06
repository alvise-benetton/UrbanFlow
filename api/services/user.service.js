
const User = require('../models/user.model');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

async function getUser(req,res) {
    // richiesta al DB
    const users = [
        { id: 1, name: 'Mario Rossi' },
        { id: 2, name: 'Luigi Verdi' }
      ];
    res.json(users);
    
}

async function createUser(req,res){
  const {email, password,nome,cognome,ruolo} = req.body;

  try {
      //verifica se esiste
      let user = await User.findOne({email});
      if (user) {
          return res.status(400).json({error: 'utente gia presernte'})
      }
      //crea nuovo
      user = new User({email, password,nome,cognome,ruolo});

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();  
      res.status(201).json({ email,nome,cognome,ruolo }); // È giusto inivare i dati in rest, o ci sono altri modi?
  } catch (err) {
      console.log(err);
      res.status(500).json({error:'Errore del server'});
  }
}


module.exports = {getUser,createUser} 