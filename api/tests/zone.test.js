const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../index');
const Zone = require('../models/zone.model');
const User = require('../models/user.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let mongoServer;
let token, TokenPayload;
const userValidToken = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'password_mario',
    role: 'admin',
};

const zonesData = [
    {
        name: "Zona Nord",
        coordinates: [[1, 2], [3, 4]],
        threshold: 50
    },
    {
        name: "Zona Centro",
        coordinates: [[4, 5], [6, 7]],
        threshold: 75
    },
    {
        name: "Zona Sud",
        coordinates: [[7, 8], [9, 10]],
        threshold: 100
    }
];

// Connessione al database in-memory prima di eseguire i test
beforeAll(async () => {
    // Crea il server MongoDB in memoria
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connetti Mongoose all'istanza in memoria
    await mongoose.connect(uri);

    const user = await User.create(userValidToken);

    // token JWT valido per il test admin.
    TokenPayload = { id: user.id, email: user.email, role: user.role };
    token = jwt.sign(TokenPayload, process.env.SUPER_SECRET, { expiresIn: '1h' });
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

describe('GET /api/zones', () => {
    it('dovrebbe restituire 200 e una lista di zone', async () => {
        await Zone.insertMany(zonesData);

        const response = await request(app)
            .get('/api/zones')
            .set('x-access-token', token)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(3);

        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    name: expect.any(String),
                    coordinates: expect.any(Array),
                    threshold: expect.any(Number),
                })
            ])
        );
    });

    it('dovrebbe restituire 401 se non viene fornito il token', async () => {
        const response = await request(app)
            .get('/api/zones')
            .expect(401);

        expect(response.body.error).toBeDefined();
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {
        const spy = jest.spyOn(Zone, 'find').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .get('/api/zones')
            .set('x-access-token', token)
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});

describe('GET /api/zones/:id', () => {
    it('dovrebbe restituire i dati di una singola zona', async () => {
        const ZoneExample = await Zone.insertMany(zonesData);

        const response = await request(app)
            .get(`/api/zones/${ZoneExample[0]._id}`)
            .set('x-access-token', token)
            .expect(200);

        expect(response.body).toEqual(
            expect.objectContaining({
                _id: expect.any(String),
                name: ZoneExample[0].name,
                threshold: ZoneExample[0].threshold,
                coordinates: expect.any(Array)
            })
        );
    });

    it('dovrebbe restituire 401 se non viene fornito il token', async () => {
        const response = await request(app)
            .get('/api/zones')
            .expect(401);

        expect(response.body.error).toBeDefined();
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {
        const spy = jest.spyOn(Zone, 'findById').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .get('/api/zones/validid')
            .set('x-access-token', token)
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});

describe('PUT /api/zones/:id', () => {
    it('dovrebbe restituire 200 e aggiornare una zona esistente', async () => {
        const zoneUpdate = await Zone.create({
            name: "Zona Nuova",
            coordinates: [[49, 50], [51, 52]],
            threshold: 500
        });

        const updates = { name: 'Zona aggiornata', coordinates: [[99, 99], [100, 100]] };

        const response = await request(app)
            .put(`/api/zones/${zoneUpdate._id}`)
            .set('x-access-token', token)
            .send(updates)
            .expect(200);

        expect(response.body.data).toMatchObject(updates);
    });

    it('dovrebbe restituire 404 se la zona non esiste', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();

        const response = await request(app)
            .put(`/api/zones/${nonExistentId}`)
            .set('x-access-token', token)
            .send({ name: 'Test' })
            .expect(404);

        expect(response.body.message).toBe('Zona non trovata');
    });

    it('dovrebbe restituire 500 in caso di errore del server', async () => {
        const spy = jest.spyOn(Zone, 'findByIdAndUpdate').mockImplementation(() => ({
            select: jest.fn().mockRejectedValue(new Error('Errore del server'))
        }));

        const ZoneTest = await Zone.create({
            name: "Zona Errore",
            coordinates: [[49, 50], [51, 52]],
            threshold: 500
        });

        const response = await request(app)
            .put(`/api/zones/${ZoneTest._id}`)
            .set('x-access-token', token)
            .send({ name: 'Test' })
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});