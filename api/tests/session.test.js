const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../index');
const Users = require('../models/user.model');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });


let mongoServer;
let tokenAdmin, adminTokenPayload;
const usersAdmin = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'password_mario',
    role: 'admin',
};


// Connessione al database in-memory prima di eseguire i test
beforeAll(async () => {
    // Crea il server MongoDB in memoria
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connetti Mongoose all'istanza in memoria
    await mongoose.connect(uri);

    const users = await Users.create(usersAdmin);


    // token JWT valido per il test admin.
    adminTokenPayload = { id: users.id, email: users.email, role: users.role };
    tokenAdmin = jwt.sign(adminTokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });

});

afterEach(async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany({});
    }
});

afterAll(async () => {
    await mongoose.connection.close();
    await mongoServer.stop();
});


describe('POST /api/session', () => {
    it('dovrebbe restituire un token JWT per credenziali valide', async () => {
        const mockUsers = {
            name: 'test',
            surname: 'users',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'users'
        };

        await Users.create(mockUsers);

        const res = await request(app)
            .post('/api/session')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('JWT');
    });

    it('dovrebbe restituire errore 400 se mancano email o password', async () => {
        const res = await request(app)
            .post('/api/session')
            .send({ email: 'test@example.com' });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: "'email' e 'password' sono campi obbligatori" });
    });

    it('dovrebbe restituire errore 401 per email non registrata', async () => {
        const res = await request(app)
            .post('/api/session')
            .send({
                email: 'notfound@example.com',
                password: 'password123',
            });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Credenziali non valide' });
    });

    it('dovrebbe restituire errore 401 per password errata', async () => {
        const mockUsers = {
            name: 'test',
            surname: 'users',
            email: 'test@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'users'
        };

        await Users.create(mockUsers);

        const res = await request(app)
            .post('/api/session')
            .send({
                email: 'test@example.com',
                password: 'wrongpassword',
            });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ error: 'Credenziali non valide' });
    });

    // it('dovrebbe restituire errore 500 in caso di errore del server', async () => {
    //   const spy = jest.spyOn(Users, 'findOne').mockRejectedValue(new Error('Internal Server Error'));

    //   const res = await request(app)
    //   .post('/api/session')
    //   .send({
    //     email: 'test@example.com',
    //     password: 'password123',
    //   })
    //   .expect(500);

    //   console.log(res.body.error);


    //   expect(res.body.error).toEqual('Internal Server Error');

    //   spy.mockRestore();
    // });
});

describe('DELETE /session', () => {
    it('dovrebbe restituire 400 se manca il token', async () => {
        // Non inviamo l'header 'x-access-token'
        const res = await request(app)
            .delete('/api/session')
            .expect(401);

        expect(res.body).toEqual({ error: 'Nessun token' });
    });

    it('dovrebbe restituire 204 e aggiungere il token in blacklist se presente', async () => {
        const token = 'testToken123';

        // Eseguiamo la richiesta inviando il token nell'header
        const res = await request(app)
            .delete('/api/session')
            .set('x-access-token', tokenAdmin)
            .expect(204);

        
    });


});

