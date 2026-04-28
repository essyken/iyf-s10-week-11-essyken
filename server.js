require('dotenv').config();

const app = require('./src/app');
const connectDB = require('./src/config/database');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

connectDB();

console.log(`Running in ${NODE_ENV} mode`);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});