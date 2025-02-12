const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const jwt = require('jsonwebtoken');
const app = require('../index');
const Event = require('../models/event.model');
const User = require('../models/user.model');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });



let mongoServer;
let tokenAdmin, adminTokenPayload;
const userAdmin = {
    name: 'Mario',
    surname: 'Rossi',
    email: 'mario.rossi@example.com',
    password: 'password_mario',
    role: 'admin',
};

const eventsData = [
    {
        title: "Festival dell'economia",
        startDate: "2024-11-19T15:00:00.000Z",
        endDate: "2024-11-19T18:00:00.000Z",
        zones: [1, 2],
    },
    {
        title: 'Conferenza sulla tecnologia',
        startDate: "2024-12-01T10:00:00.000Z",
        endDate: "2024-12-01T12:30:00.000Z",
        zones: [3, 4, 5],
    },
    {
        title: 'Workshop di design',
        startDate: "2024-12-05T14:00:00.000Z",
        endDate: "2024-12-05T16:00:00.000Z",
        zones: [2],
    },
];

// Connessione al database in-memory prima di eseguire i test
beforeAll(async () => {
    // Crea il server MongoDB in memoria
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connetti Mongoose all'istanza in memoria
    await mongoose.connect(uri);

    const user = await User.create(userAdmin);


    // token JWT valido per il test admin.
    adminTokenPayload = { id: user.id, email: user.email, role: user.role };
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

describe('GET /api/events', () => {
    it('dovrebbe restituire una lista di eventi', async () => {

        await Event.insertMany(eventsData);


        const response = await request(app)
            .get('/api/events')
            .set('x-access-token', tokenAdmin)
            .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(3);

        expect(response.body).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    title: expect.any(String),
                    startDate: expect.any(String),
                    endDate: expect.any(String),
                    zones: expect.any(Array),
                }),
            ])
        );

    });



    it('dovrebbe restituire 401 se non viene fornito il token', async () => {
        const response = await request(app)
            .get('/api/events')
            .expect(401);

        expect(response.body.error).toBeDefined();
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {

        const spy = jest.spyOn(Event, 'find').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .get('/api/events')
            .set('x-access-token', tokenAdmin)
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});


describe('GET /api/events:id', () => {
    it('dovrebbe restituire una lista di eventi', async () => {

        const eventExample = await Event.insertMany(eventsData);

        const response = await request(app)
            .get(`/api/events/${eventExample[0]._id}`)
            .set('x-access-token', tokenAdmin)
            .expect(200);

        //controllo valori aspettati
        const bodiel = await response.body;
        console.log(bodiel);
        console.log('assadsdsadadsaasdsadas');


        expect(response.body).toEqual(
            expect.objectContaining({
                _id: eventExample[0]._id.toString(),
                title: eventExample[0].title,
                endDate: eventsData[0].endDate,
                startDate: eventsData[0].startDate,
                zones: eventExample[0].zones,
            })
        );
    });



    it('dovrebbe restituire 401 se non viene fornito il token', async () => {
        const response = await request(app)
            .get('/api/events')
            .expect(401);

        expect(response.body.error).toBeDefined();
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {

        const spy = jest.spyOn(Event, 'findById').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .get('/api/events/validid')
            .set('x-access-token', tokenAdmin)
            .expect(500);

        expect(response.text).toBe('Errore del server');

        spy.mockRestore();
    });
});


describe('POST /api/events', () => {
    it('dovrebbe creare un evento con dati validi', async () => {
        const eventToAdd = {
            title: 'Test Event',
            startDate: '2025-02-11',
            endDate: '2025-02-12',
            zones: [8, 9]
        };

        const response = await request(app)
            .post('/api/events')
            .set('x-access-token', tokenAdmin)
            .send(eventToAdd)
            .expect(201);

        expect(response.body).toEqual({
            message: 'Evento creato con successo',
            data: eventToAdd,
        });
    });

    it('dovrebbe restituire errore 400 se mancano i parametri', async () => {
        const response = await request(app)
            .post('/api/events')
            .set('x-access-token', tokenAdmin)
            .send({ title: 'Test Event' })
            .expect(400);

        expect(response.body).toEqual({ error: 'Bad request: tutti i campi sono obbligatori' });
    });

    it('dovrebbe restituire errore 400 se esiste già un evento con lo stesso titolo e date', async () => {
        const eventToAdd = {
            title: 'Test Event',
            startDate: '2025-02-11',
            endDate: '2025-02-12',
            zones: [8, 9]
        };

        await Event.create(eventToAdd); // Crea l'evento nel database in-memory

        const response = await request(app)
            .post('/api/events')
            .set('x-access-token', tokenAdmin)
            .send(eventToAdd)
            .expect(400);


        expect(response.body.error).toEqual('Evento già presente con lo stesso titolo e date');
    });

    it('dovrebbe restituire 500 se c\'è un errore del server', async () => {

        const spy = jest.spyOn(Event, 'findOne').mockRejectedValue(new Error('Errore del server'));

        const response = await request(app)
            .post('/api/events')
            .set('x-access-token', tokenAdmin)
            .send({
                title: 'Test Event',
                startDate: '2025-02-11',
                endDate: '2025-02-12',
                zones: [8, 9]
            })
            .expect(500);

        expect(response.body.error).toBe('Errore del server');

        spy.mockRestore();
    });
});

describe('PUT /api/events/:id', () => {
    it('dovrebbe restituire 200 e aggiornare un evento esistente', async () => {
      
      
      const eventUpdate = await Event.create({
        title: 'Test Event',
        startDate: '2025-02-11',
        endDate: '2025-02-12',
        zones: [8, 9]
    });
  
      const updates = { title: 'updated title', zones: [3, 4]};
  
      const response = await request(app)
        .put(`/api/events/${eventUpdate._id}`)
        .set('x-access-token', tokenAdmin)
        .send(updates)
        .expect(200);
  
      expect(response.body.data).toMatchObject(updates);
    });
  
    it('dovrebbe restituire 404 se l\'evento non esiste', async () => {
         const nonExistentId = new mongoose.Types.ObjectId();
  
      const response = await request(app)
        .put(`/api/events/${nonExistentId}`)
        .set('x-access-token', tokenAdmin)
        .send({ title: 'Test' })
        .expect(404);
  
      expect(response.body.message).toBe('Evento non trovato');
    });
  
    it('dovrebbe restituire 500 in caso di errore del server', async () => {
      const spy = jest.spyOn(Event, 'findByIdAndUpdate').mockImplementation(() => ({
        select: jest.fn().mockRejectedValue(new Error('Errore del server'))
      }));
  
      const eventTest = await Event.create({
        title: 'Error Event',
        startDate: '2025-02-11',
        endDate: '2025-02-12',
        zones: [8, 9]
    });
  
      const response = await request(app)
        .put(`/api/events/${eventTest._id}`)
        .set('x-access-token', tokenAdmin)
        .send({ name: 'Test' })
        .expect(500);
  
      expect(response.text).toBe('Errore del server');
  
      spy.mockRestore();
    });
});


describe('DELETE /api/events/:id', () => {
    it('dovrebbe restituire 200 e confermare l\'eliminazione dell\'evento', async () => {
       
        const eventToDel = await Event.create({
            title: 'Test Event to delete',
            startDate: '2025-02-11',
            endDate: '2025-02-12',
            zones: [8, 9]
        });
  
      const response = await request(app)
        .delete(`/api/events/${eventToDel._id}`)
        .set('x-access-token', tokenAdmin)
        .expect(200);
  
      expect(response.body.message).toBe('Evento eliminato con successo');
  
      const deletedUser = await User.findById(eventToDel._id);
      expect(deletedUser).toBeNull();
    });
  
    it('dovrebbe restituire 404 se l\'evento non esiste', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
  
      const response = await request(app)
        .delete(`/api/events/${nonExistentId}`)
        .set('x-access-token', tokenAdmin)
        .expect(404);
  
      expect(response.body.message).toBe('Evento non trovato');
    });
  
    it('dovrebbe restituire 500 in caso di errore del server', async () => {
   
      const spy = jest.spyOn(Event, 'findByIdAndDelete').mockRejectedValue(new Error('Errore del server'));
  
      const eventError = await Event.create({
        title: 'Error Event',
        startDate: '2025-02-11',
        endDate: '2025-02-12',
        zones: [8, 9]
    });
  
      const response = await request(app)
        .delete(`/api/events/${eventError._id}`)
        .set('x-access-token', tokenAdmin)
        .expect(500);
  
      expect(response.text).toBe('Errore del server');
  
      spy.mockRestore();
    });
  });