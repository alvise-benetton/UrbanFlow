const app = require('./index');

// Avvio del server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server avviato sulla porta ${PORT}`));