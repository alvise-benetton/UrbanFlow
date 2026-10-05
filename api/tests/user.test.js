const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../index');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


// Variabili per il server in-memory
let mongoServer;

// Connessione al database in-memory prima di eseguire i test
beforeAll(async () => {
  // Crea il server MongoDB in memoria
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Connetti Mongoose all'istanza in memoria
  await mongoose.connect(uri);
});

// Pulisce il database dopo ogni test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Chiude la connessione e ferma il server in-memory al termine di tutti i test
afterAll(async () => {
  await mongoose.connection.close();
  await mongoServer.stop();
});

const userAdmin = {
  name: 'Mario',
  surname: 'Rossi',
  email: 'mario.rossi@example.com',
  password: 'password_mario',
  role: 'admin',
};

const userNormal = {
  name: 'Luca',
  surname: 'Bianchi',
  email: 'luca.bianchi@example.com',
  password: 'password_luca',
  role: 'user',
};

let tokenAdmin, tokenPayload;



describe('GET /api/users', () => {
  it('dovrebbe restituire 200 e una lista di utenti quando viene fornito un token valido', async () => {

    const user = await User.create(userAdmin);
    await User.create(userNormal);

    // token JWT valido per il test admin.
    adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get('/api/users')
      .set('x-access-token', tokenAdmin)
      .expect(200);

    //controllo valori aspettati
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          _id: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
          surname: expect.any(String),
          role: expect.any(String),
        }),
      ])
    );

  });



  it('dovrebbe restituire 401 se non viene fornito il token', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(401);

    expect(response.body.error).toBeDefined();
  });



  it('dovrebbe restituire 403 se il token non è corretto', async () => {
    // token JWT valido per il test.
    const tokenPayload = { id: userNormal.id, email: userNormal.email, role: userNormal.role };
    const token = jwt.sign(tokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });
    const response = await request(app)
      .get('/api/users')
      .set('x-access-token', token)
      .expect(403);

    expect(response.body.error).toBeDefined();
  });

  it('dovrebbe restituire 500 se c\'è un errore del server', async () => {
    const user = await User.create(userAdmin);

    // token JWT valido per il test.
    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const spy = jest.spyOn(User, 'find').mockRejectedValue(new Error('Errore del server'));

    const response = await request(app)
      .get('/api/users')
      .set('x-access-token', token)
      .expect(500);

    expect(response.text).toBe('Errore del server');

    spy.mockRestore();
  });
});



describe('GET /api/users/:id', () => {
  it('dovrebbe restituire 200 e un utente quando viene fornito un ID valido', async () => {

    const user = await User.create(userAdmin);

    // token JWT valido per il test.
    tokenPayload = { id: user.id, email: user.email, role: user.role };
    token = jwt.sign(tokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const response = await request(app)
      .get(`/api/users/${user._id}`)
      .set('x-access-token', token)
      .expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role,
      })
    );
  });



  it('dovrebbe restituire 401 se non viene fornito il token', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(401);

    expect(response.body.error).toBeDefined();
  });



  it('dovrebbe restituire 403 se il token non è corretto', async () => {
    // token JWT valido per il test.
    const tokenPayload = { id: userNormal.id, email: userNormal.email, role: userNormal.role };
    const token = jwt.sign(tokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });
    const response = await request(app)
      .get('/api/users')
      .set('x-access-token', token)
      .expect(403);

    expect(response.body.error).toBeDefined();
  });



  it('dovrebbe restituire 500 se c\'è un errore del server', async () => {
    const spy = jest.spyOn(User, 'findById').mockRejectedValue(new Error('Errore del server'));

    const response = await request(app)
      .get('/api/users/validid')
      .set('x-access-token', token)
      .expect(500);

    expect(response.text).toBe('Errore del server');

    spy.mockRestore();
  });
});



describe('POST /api/users', () => {
  it('dovrebbe restituire 201 e creare un nuovo utente quando i dati sono corretti', async () => {
    const user = await User.create(userAdmin);


    // token JWT valido per il test admin.
    adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });


    const response = await request(app)
      .post('/api/users')
      .set('x-access-token', tokenAdmin)
      .send(userNormal)
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        email: userNormal.email,
        name: userNormal.name,
        surname: userNormal.surname,
        role: userNormal.role,
      })
    );

    const userInDb = await User.findOne({ email: userNormal.email });
    expect(userInDb).not.toBeNull();
    expect(await bcrypt.compare(userNormal.password, userInDb.password)).toBe(true);
  });

  it('dovrebbe restituire 400 se i dati sono incompleti', async () => {
    const response = await request(app)
      .post('/api/users')
      .set('x-access-token', tokenAdmin)
      .send({ email: 'incomplete@example.com', password: '1234' }) // Mancano name, surname e role
      .expect(400);

    expect(response.body.error).toBe('Bad request');
  });

  it('dovrebbe restituire 400 se l\'utente esiste già', async () => {
    await User.create({
      email: 'existing@example.com',
      password: await bcrypt.hash('password123', 10),
      name: 'Luigi',
      surname: 'Verdi',
      role: 'user',
    });

    const response = await request(app)
      .post('/api/users')
      .set('x-access-token', tokenAdmin)
      .send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Luigi',
        surname: 'Verdi',
        role: 'user',
      })
      .expect(400);

    expect(response.body.error).toBe('Utente gia presernte');
  });

  it('dovrebbe restituire 500 in caso di errore del server', async () => {
    const spy = jest.spyOn(User, 'findOne').mockRejectedValue(new Error('Errore del server'));

    const response = await request(app)
      .post('/api/users')
      .set('x-access-token', tokenAdmin)
      .send({
        email: 'error@example.com',
        password: 'password123',
        name: 'Error',
        surname: 'User',
        role: 'user',
      })
      .expect(500);

    expect(response.body.error).toBe('Errore del server');
    spy.mockRestore();
  });
});



describe('PUT /api/users/:id', () => {
  it('dovrebbe restituire 200 e aggiornare un utente esistente', async () => {
    const user = await User.create(userAdmin);

    // token JWT valido per il test admin.
    adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const userUpdate = await User.create({
      email: 'update@example.com',
      password: 'password123',
      name: 'Mario',
      surname: 'Rossi',
      role: 'user',
    });

      const updates = {
        name: 'Luigi',
        surname: 'Verdi',
        password: 'newpass123'
      };

    const response = await request(app)
      .put(`/api/users/${userUpdate._id}`)
      .set('x-access-token', tokenAdmin)
      .send(updates)
      .expect(200);

     const updatedUser = await User.findById(userUpdate._id);
    const isPasswordCorrect = await bcrypt.compare(updates.password, updatedUser.password);
    

    expect(response.body.data.name).toBe(updates.name);
    expect(response.body.data.surname).toBe(updates.surname);
    expect(isPasswordCorrect).toBe(true);
  });

  it('dovrebbe restituire 404 se l\'utente non esiste', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .put(`/api/users/${nonExistentId}`)
      .set('x-access-token', tokenAdmin)
      .send({ name: 'Test' })
      .expect(404);

    expect(response.body.message).toBe('Utente non trovato');
  });

  it('dovrebbe restituire 500 in caso di errore del server', async () => {
    const spy = jest.spyOn(User, 'findByIdAndUpdate').mockImplementation(() => ({
      select: jest.fn().mockRejectedValue(new Error('Errore del server'))
    }));

    const usertest = await User.create({
      email: 'error@example.com',
      password: 'password123',
      name: 'Error',
      surname: 'User',
      role: 'user',
    });

    const response = await request(app)
      .put(`/api/users/${usertest._id}`)
      .set('x-access-token', tokenAdmin)
      .send({ name: 'Test' })
      .expect(500);

    expect(response.text).toBe('Errore del server');

    spy.mockRestore();
  });
});



describe('DELETE /api/users/:id', () => {
  it('dovrebbe restituire 204', async () => {
    const user = await User.create(userAdmin);

    // token JWT valido per il test admin.
    adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const userToDel = await User.create({
      email: 'delete@example.com',
      password: 'password123',
      name: 'Mario',
      surname: 'Rossi',
      role: 'user',
    });

    const response = await request(app)
      .delete(`/api/users/${userToDel._id}`)
      .set('x-access-token', tokenAdmin)
      .expect(204);

    

    const deletedUser = await User.findById(userToDel._id);
    expect(deletedUser).toBeNull();
  });

  it('dovrebbe restituire 404 se l\'utente non esiste', async () => {
    const user = await User.create(userAdmin);

    // token JWT valido per il test admin.
    const adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    const tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const nonExistentId = new mongoose.Types.ObjectId();

    const response = await request(app)
      .delete(`/api/users/${nonExistentId}`)
      .set('x-access-token', tokenAdmin)
      .expect(404);

    expect(response.body.message).toBe('Utente non trovato');
  });

  it('dovrebbe restituire 500 in caso di errore del server', async () => {
    const user = await User.create(userAdmin);

    // token JWT valido per il test admin.
    const adminTokenPayload = { id: user.id, email: user.email, role: user.role };
    const tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

    const spy = jest.spyOn(User, 'findByIdAndDelete').mockRejectedValue(new Error('Errore del server'));

    const userError = await User.create({
      email: 'error@example.com',
      password: 'password123',
      name: 'Error',
      surname: 'User',
      role: 'user',
    });

    const response = await request(app)
      .delete(`/api/users/${userError._id}`)
      .set('x-access-token', tokenAdmin)
      .expect(500);

    expect(response.text).toBe('Errore del server');

    spy.mockRestore();
  });
});