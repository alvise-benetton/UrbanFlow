const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const users = require('../models/user.model');

const blacklist = require('../middleware/tokenChecker').blacklist; // Blacklist dei token

async function createSession(req,res) {
    
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
            return res.status(401).json({ error: 'Credenziali non valide' });;
        }
        // se le password non corrispondono
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Credenziali non valide'});
        }
        const token = await jwt.sign(
            { id: user.id, email: user.email, role: user.role},
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

async function deleteSession(req,res) { // i token JWT non sono revocabili, al logout bisogna inserirli in una blacklist e poi eliminarli a scadenza
    try {
        let token = req.headers['x-access-token'];

        if (!token) {
            return res.status(400).json({ error: "Token mancante" });
        }

        blacklist.add(token); // Aggiungi il token alla blacklist
        return res.status(200).json({ message: "Logout effettuato con successo" });
    } catch (error) {
        return res.status(500).json({ error: 'Errore durante il logout: ' + error });
    }
}

function deleteExpiredToken() {
    blacklist.forEach(token => {
        jwt.verify(token, process.env.SUPER_SECRET, (err) => {
            if (err && err.name === "TokenExpiredError") { // guardo se è scaduto
                blacklist.delete(token);
            }
        });
    });
}

setInterval(deleteExpiredToken, 60 * 20 * 1000); // ogni 20 minuti eliminino i token in blacklist scaduti.


module.exports = {createSession,deleteSession};