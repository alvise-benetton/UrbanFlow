const User = require('../models/user.model');
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

async function getUsers(req, res) {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const users = await User.find(filter, '-createdAt -updatedAt -password -__v');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}


async function getUserById(req, res) {
  const userId = req.params.id;
  try {
    // Recupera la lista di tutti gli utenti (solo le email)
    const users = await User.findById(userId, '-createdAt -updatedAt -password -__v');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

async function createUser(req,res){
  const {email, password,name,surname,role} = req.body;

  try {
    // check prametri
    if(!(email && password && name && surname && role)){
        return res.status(400).json({error: 'Bad request'});
    }

      //verifica se esiste
      let user = await User.findOne({email});
      if (user) {
          return res.status(400).json({error: 'Utente gia presernte'})
      }
      //crea nuovo
      user = new User({email, password,name,surname,role});

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();  
      res.status(201).json({ email,name,surname,role }); // È giusto inivare i dati in rest, o ci sono altri modi?
  } catch (err) {
      console.log(err);
      res.status(500).json({error:'Errore del server'});
  }
}

async function updateUser(req, res) {
  try {
    const userId = req.params.id;  
    const updates = req.body;      

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true } 
      /*
      [options.new=false] «Boolean» if true, return the modified document rather than the original
      [options.runValidators] «Boolean» if true, runs update validators on this command. 
      Update validators validate the update operation against the model's schema
      */
    ).select('-password -createdAt -updatedAt -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({data: updatedUser });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

async function deleteUser(req, res) {
  try {
    const userId = req.params.id; // Estrai l'ID dell'utente dalla route

    // Trova l'utente tramite l'ID e lo elimina
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ message: 'Utente eliminato con successo' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Errore del server');
  }
}

module.exports = {getUsers, getUserById, createUser, updateUser, deleteUser} 