require('dotenv').config();
const app = require('./index');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`UrbanFlow API server avviato sulla porta ${PORT}`);
});