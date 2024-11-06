const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const session = require('../models/session.model');
const users = require('../models/user.model');

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

        // salvo il JWT nel database
        const s = new session({
            userId: user._id,
            token: token
        });
        await s.save();

        return res.status(200).json({
            JWT: token
        });

    }catch (error) {
        return res.status(500).json({error: 'Internal Server Error. '+ error });
    }
}
// da mettere in post user
async function deleteSession(req,res) {
    throw "non implementato";
}


module.exports = {createSession,deleteSession};