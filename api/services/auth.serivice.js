const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Auth = require('../models/auth.model');
const User = require('../models/user.model');

async function login(req,res) {
    
    try{
        // controllo che la richiesta contenga esattamente email e password
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "'email' e 'password' sono campi obbligatori"});
        }

        let user = await users.findOne({
            email: req.body.email
        }).exec();

        // Se non c'è un utente corrispondente all'email
        if (!user) {
            res.status(401).json({ error: 'Credenziali non valide' });
            return;
        }
        // se le password non corrispondono
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: 'Credenziali non valide'});
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.SUPER_SECRET,
            { expiresIn: '1h' } // scadenza
        );

        return res.status(200).json({
            JWT: token
        });

    }catch (error) {
        return res.status(500).json({error: 'Internal Server Error. '+ error });
    }
}

async function register(req,res){
    const {email, password} = req.body;

    try {
        //verifica se esiste
        let user = await User.findOne({email});
        if (user) {
            return res.status(200).json({msg: 'utente gia presernte'})
        }

        //crea nuovo
        user = new User({email, password});

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        //creazione del token
        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    
        res.json({ token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Errore del server');
    }
}


module.exports = {login,register};