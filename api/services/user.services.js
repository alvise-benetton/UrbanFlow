const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

async function getUsers(req, res) {
  try {
    const filter = {};

    if (req.query.role) {
      filter.role = req.query.role;
    }

    const query = User.find(filter, '-createdAt -updatedAt -password -__v');
    const users = typeof query.lean === 'function' ? await query.lean() : await query;
    res.json(users);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function getUserById(req, res) {
  const userId = req.params.id;
  try {
    const query = User.findById(userId, '-createdAt -updatedAt -password -__v');
    const user = typeof query.lean === 'function' ? await query.lean() : await query;
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function createUser(req, res) {
  const { email, password, name, surname, role } = req.body;

  try {
    if (!(email && password && name && surname && role)) {
      return res.status(400).json({ error: 'Bad request' });
    }

    const query = User.findOne({ email });
    const existingUser = typeof query.lean === 'function' ? await query.lean() : await query;
    if (existingUser) {
      return res.status(400).json({ error: 'Utente gia presernte' });
    }

    const user = new User({ email, password, name, surname, role });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();
    return res.status(201).json({ email, name, surname, role });
  } catch (err) {
    return res.status(500).json({ error: 'Errore del server' });
  }
}

async function updateUser(req, res) {
  try {
    const userId = req.params.id;
    const updates = req.body;

    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(updates.password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password -createdAt -updatedAt -__v');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ data: updatedUser });
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).send('Errore del server');
  }
}

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };