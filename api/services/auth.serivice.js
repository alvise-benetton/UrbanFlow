const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const Auth = require('../models/auth.model')

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
    throw "Non implementata";
}


module.exports = {login,register};