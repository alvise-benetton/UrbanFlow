const app = require('./index');
require('dotenv').config();

// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));