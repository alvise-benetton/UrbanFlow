const mongoose = require('mongoose');

const connectDB = async () => {
    try {      
        await mongoose.connect(process.env.DB_URL);
        console.log('MongoDb connesso');
        
    } catch (error) {
        console.log('Errore di connessione: ', error.message);
        process.exit(1);        
    }
};

module.exports = connectDB;
