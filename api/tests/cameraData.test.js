const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../index');
const Zone = require('../models/zone.model');
const User = require('../models/user.model');
const CameraData = require('../models/cameraData.model');
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
        zone: [1, 2],
        threshold: 50
    },
    {
        name: "Zona Centro",
        zone: [4, 5],
        threshold: 75
    },
    {
        name: "Zona Sud",
        zone: [7, 8],
        threshold: 100
    }
];

const cameraDataSeed = [
    {
        zone: "Zona Nord",
        data: [
            { density: 45, timestamp: 1708345600 },
            { density: 50, timestamp: 1708349200 }
        ]
    },
    {
        zone: "Zona Centro",
        data: [
            { density: 60, timestamp: 1708352800 },
            { density: 65, timestamp: 1708356400 }
        ]
    },
    {
        zone: "Zona Sud",
        data: [
            { density: 30, timestamp: 1708360000 },
            { density: 35, timestamp: 1708363600 }
        ]
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

describe('GET /api/cameraData', () => {
    it('dovrebbe restituire 200 e una lista di misurazioni', async () => {

        await CameraData.insertMany(cameraDataSeed);

        const response = await request(app)
            .get('/api/cameraData')
            .set('x-access-token', token)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(3);

        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    _id: expect.any(String),
                    zone: expect.any(String),
                    data: expect.arrayContaining([
                        expect.objectContaining({
                            density: expect.any(Number),
                            timestamp: expect.any(Number),
                        })
                    ])
                })
            ])
        );


    });



    it('dovrebbe restituire 401 se non viene fornito il token', async () => {
        const response = await request(app)
            .get('/api/cameraData')
            .expect(401);

        expect(response.body.error).toBeDefined();
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {

        const spy = jest.spyOn(CameraData, 'find').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .get('/api/cameraData')
            .set('x-access-token', token)
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});

//TODO la funzione add da confermare
// describe('POST /api/cameraData', () => {
//     it('dovrebbe inserire una nuova rilevazione dalla camera', async () => {
//         const CameraDataToAdd = {
//             zone: "Zona Sud",
//             data: [
//                 { density: 45, timestamp: 1708360001 },
//                 { density: 30, timestamp: 1708360000 },
//                 { density: 35, timestamp: 1708363600 }
//             ]
//         };

//         const response = await request(app)
//             .post('/api/cameraData')
//             .set('x-access-token', token)
//             .send(CameraDataToAdd)
//             .expect(201);

//         expect(response.body).toEqual({
//             data: CameraDataToAdd
//         });
//     });

//     it('dovrebbe restituire errore 400 se mancano i parametri o sono sbagliati', async () => {
//         const response = await request(app)
//             .post('/api/cameraData')
//             .set('x-access-token', token)
//             .send({ density: -8 })
//             .expect(400);

//         expect(response.body).toEqual({ message: 'Bad request' });
//     });

//     it('dovrebbe restituire errore 404 se non esiste la zona', async () => {
//         const CameraDataToUpdate = {
//             zone: "Zona Non presente",
//             data: [
//                 { density: 45, timestamp: 1708360001 },
//                 { density: 30, timestamp: 1708360000 },
//                 { density: 35, timestamp: 1708363600 }
//             ]
//         };

//         // await CameraData.create(CameraDataToUpdate); 

//         const response = await request(app)
//             .post('/api/cameraData')
//             .set('x-access-token', token)
//             .send(CameraDataToUpdate)
//             .expect(400);


//         expect(response.body.message).toEqual('Zona non trovata');
//     });

//     it('dovrebbe restituire 500 se c\'è un errore del server', async () => {

//         const spy = jest.spyOn(CameraData, 'findById').mockRejectedValue(new Error('Errore del server'));

//         const response = await request(app)
//             .post('/api/cameraData')
//             .set('x-access-token', token)
//             .send({
//                 zone: "Zona Non presente",
//                 data: [
//                 { density: 45, timestamp: 1708360001 },
//                 { density: 30, timestamp: 1708360000 },
//                 { density: 35, timestamp: 1708363600 }
//             ]
//             })
//             .expect(500);

//         expect(response.body.error).toBe('Errore del server');

//         spy.mockRestore();
//     });
// });