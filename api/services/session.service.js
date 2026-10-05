const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Users = require('../models/user.model');
const blacklist = require('../middleware/tokenChecker').blacklist;

async function createSession(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "'email' e 'password' sono campi obbligatori" });
    }

    const query = Users.findOne({ email });
    const user = typeof query.lean === 'function' ? await query.lean() : await query;
    if (!user) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      process.env.SUPER_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(201).json({
      JWT: token,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

async function deleteSession(req, res) {
  try {
    const token = req.headers['x-access-token'];
    if (token) {
      blacklist.add(token);
    }
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Errore durante il logout: ' + error.message });
  }
}

function deleteExpiredToken() {
  blacklist.forEach((token) => {
    jwt.verify(token, process.env.SUPER_SECRET, (err) => {
      if (err && err.name === 'TokenExpiredError') {
        blacklist.delete(token);
      }
    });
  });
}

if (process.env.NODE_ENV !== 'test') {
  const timer = setInterval(deleteExpiredToken, 1000 * 60 * 15);
  if (timer.unref) timer.unref();
}

module.exports = { createSession, deleteSession };
